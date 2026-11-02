"""WhatsApp auto-reply bot built with Flask and Meta's WhatsApp Cloud API."""
import hashlib
import hmac
import json
import logging
import os
from collections import OrderedDict
from pathlib import Path

import requests
from flask import Flask, abort, request

PUNCTUATION = ".,!?;:'\"()[]{}-_/\\|।…"
SEEN_LIMIT = 1000
RULES_PATH = Path(__file__).with_name("rules.json")

log = logging.getLogger("whatsapp-bot")


def normalise(text):
    """Lowercase the text and turn punctuation into spaces."""
    cleaned = text.lower().translate({ord(c): " " for c in PUNCTUATION})
    return f" {' '.join(cleaned.split())} "


def choose_reply(text, config):
    """Return the reply of the first rule with a keyword in the message."""
    message = normalise(text)
    for rule in config["rules"]:
        if any(f" {keyword} " in message for keyword in rule["keywords"]):
            return rule["reply"]
    return config["fallback"]


def signature_is_valid(secret, body, header):
    """Check that a webhook call was really signed by Meta."""
    if not header or not header.startswith("sha256="):
        return False
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(header[len("sha256="):], expected)


def incoming_messages(payload):
    """Yield every message in a webhook payload."""
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            yield from change.get("value", {}).get("messages", [])


def create_app(settings=None, send=None):
    settings = settings or {
        "verify_token": os.environ["VERIFY_TOKEN"],
        "app_secret": os.environ["APP_SECRET"],
        "access_token": os.environ["ACCESS_TOKEN"],
        "phone_number_id": os.environ["PHONE_NUMBER_ID"],
        "graph_version": os.environ.get("GRAPH_VERSION", "v23.0"),
    }
    config = json.loads(RULES_PATH.read_text(encoding="utf-8"))
    seen = OrderedDict()
    app = Flask(__name__)

    def send_text(to, body):
        response = requests.post(
            f"https://graph.facebook.com/{settings['graph_version']}"
            f"/{settings['phone_number_id']}/messages",
            headers={"Authorization": f"Bearer {settings['access_token']}"},
            json={
                "messaging_product": "whatsapp",
                "to": to,
                "type": "text",
                "text": {"body": body},
            },
            timeout=5,
        )
        response.raise_for_status()

    deliver = send or send_text

    def first_time(message_id):
        """Meta can repeat a webhook, so answer each message only once."""
        if message_id in seen:
            return False
        seen[message_id] = True
        if len(seen) > SEEN_LIMIT:
            seen.popitem(last=False)
        return True

    @app.get("/")
    def health():
        return {"status": "ok"}

    @app.get("/webhook")
    def verify():
        token_ok = hmac.compare_digest(
            request.args.get("hub.verify_token", ""), settings["verify_token"]
        )
        if request.args.get("hub.mode") == "subscribe" and token_ok:
            return request.args.get("hub.challenge", ""), 200
        abort(403)

    @app.post("/webhook")
    def receive():
        body = request.get_data()
        header = request.headers.get("X-Hub-Signature-256")
        if not signature_is_valid(settings["app_secret"], body, header):
            abort(403)
        for message in incoming_messages(json.loads(body)):
            if not first_time(message.get("id")):
                continue
            if message.get("type") == "text":
                reply = choose_reply(message["text"]["body"], config)
            else:
                reply = config["non_text"]
            try:
                deliver(message["from"], reply)
            except requests.RequestException as error:
                # Status codes only: request details contain the access token.
                status = getattr(error.response, "status_code", "no response")
                log.error("Could not send reply: %s", status)
        return "", 200

    return app


if __name__ == "__main__":
    create_app().run(port=int(os.environ.get("PORT", 5000)))
