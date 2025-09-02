#!/usr/bin/env bash
# Usage: notify_telegram.sh "TITLE" "message body"
# Requires env vars: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID

BOT="${TELEGRAM_BOT_TOKEN:-}"
CHAT="${TELEGRAM_CHAT_ID:-}"

if [ -z "$BOT" ] || [ -z "$CHAT" ]; then
  echo "notify_telegram: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set"
  exit 1
fi

TITLE="$1"
BODY="$2"

# Compose message with timestamp
MSG="*${TITLE}*\n$(date -u +"%Y-%m-%d %H:%M:%S UTC")\n\n${BODY}"

# Send via Telegram (markdown)
curl -s -X POST "https://api.telegram.org/bot${BOT}/sendMessage" \
  -d chat_id="${CHAT}" \
  -d parse_mode="Markdown" \
  -d text="${MSG}" >/dev/null 2>&1 || true
