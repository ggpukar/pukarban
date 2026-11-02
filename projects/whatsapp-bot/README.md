# WhatsApp auto-reply bot

A Python and Flask webhook that answers WhatsApp messages automatically through Meta's WhatsApp Cloud API. Replies live in `rules.json`, so you can change them without touching the code.

## Features

- Keyword rules, in English and Nepali
- Checks Meta's signature on every webhook call
- Answers each message once, even if Meta repeats the webhook
- Polite reply for images, audio and other non-text messages

## Run the tests

```
pip install -r requirements.txt
pytest
```

## Go live

1. Create an app at [developers.facebook.com](https://developers.facebook.com) and add the WhatsApp product.
2. Deploy this folder to a Python host with HTTPS. Start command: `gunicorn "app:create_app()"`
3. Set the variables listed in `.env.example` in the host's settings.
4. In Meta's WhatsApp configuration, set the callback URL to `https://your-host/webhook`, enter your `VERIFY_TOKEN`, and subscribe to `messages`.
5. Send a message to your WhatsApp test number.

Run one worker process: the record of answered messages is kept in memory.
