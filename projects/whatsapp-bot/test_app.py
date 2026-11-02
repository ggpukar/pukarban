import hashlib
import hmac
import json

import pytest
import requests

from app import choose_reply, create_app, RULES_PATH

SETTINGS = {
    "verify_token": "verify-me",
    "app_secret": "secret",
    "access_token": "token",
    "phone_number_id": "123",
    "graph_version": "v23.0",
}
CONFIG = json.loads(RULES_PATH.read_text(encoding="utf-8"))


def reply_for(rule_id):
    return next(r["reply"] for r in CONFIG["rules"] if r["id"] == rule_id)


def payload(message_id="m1", text="hi", kind="text"):
    message = {"id": message_id, "from": "9779800000000", "type": kind}
    if kind == "text":
        message["text"] = {"body": text}
    return {"entry": [{"changes": [{"value": {"messages": [message]}}]}]}


def post(client, data, secret="secret"):
    body = json.dumps(data).encode()
    signature = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return client.post(
        "/webhook",
        data=body,
        headers={"X-Hub-Signature-256": f"sha256={signature}"},
    )


@pytest.fixture
def sent():
    return []


@pytest.fixture
def client(sent):
    app = create_app(SETTINGS, send=lambda to, body: sent.append((to, body)))
    return app.test_client()


@pytest.mark.parametrize(
    "text,rule",
    [
        ("Hi!", "greeting"),
        ("नमस्ते", "greeting"),
        ("MENU", "menu"),
        ("1", "projects"),
        ("show me your projects?", "projects"),
        ("what is your email", "contact"),
        ("धन्यवाद।", "thanks"),
    ],
)
def test_rules(text, rule):
    assert choose_reply(text, CONFIG) == reply_for(rule)


@pytest.mark.parametrize("text", ["this", "12", "qwerty", ""])
def test_fallback_needs_whole_word(text):
    assert choose_reply(text, CONFIG) == CONFIG["fallback"]


def test_verify_accepts_right_token(client):
    res = client.get(
        "/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=42"
    )
    assert res.status_code == 200 and res.text == "42"


def test_verify_rejects_wrong_token(client):
    res = client.get(
        "/webhook?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=42"
    )
    assert res.status_code == 403


def test_replies_to_text(client, sent):
    assert post(client, payload()).status_code == 200
    assert sent == [("9779800000000", reply_for("greeting"))]


def test_rejects_bad_signature(client, sent):
    assert post(client, payload(), secret="wrong").status_code == 403
    assert client.post("/webhook", data=b"{}").status_code == 403
    assert sent == []


def test_repeated_webhook_answers_once(client, sent):
    post(client, payload())
    post(client, payload())
    assert len(sent) == 1


def test_non_text_message(client, sent):
    post(client, payload(kind="image"))
    assert sent[0][1] == CONFIG["non_text"]


def test_status_update_sends_nothing(client, sent):
    data = {"entry": [{"changes": [{"value": {"statuses": [{"id": "x"}]}}]}]}
    assert post(client, data).status_code == 200
    assert sent == []


def test_send_failure_still_returns_200():
    def fail(to, body):
        raise requests.ConnectionError("down")

    client = create_app(SETTINGS, send=fail).test_client()
    assert post(client, payload()).status_code == 200


def test_real_sender_builds_meta_request(monkeypatch):
    calls = {}

    class Response:
        def raise_for_status(self):
            pass

    def fake_post(url, headers, json, timeout):
        calls.update(url=url, headers=headers, json=json, timeout=timeout)
        return Response()

    monkeypatch.setattr(requests, "post", fake_post)
    post(create_app(SETTINGS).test_client(), payload())
    assert calls["url"] == "https://graph.facebook.com/v23.0/123/messages"
    assert calls["headers"]["Authorization"] == "Bearer token"
    assert calls["json"]["to"] == "9779800000000"
    assert calls["json"]["text"]["body"] == reply_for("greeting")
