#!/bin/bash
LOG_FILE="/storage/emulated/0/Download/Beths pet store/auto_cron.log"
TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN"
TELEGRAM_CHAT_ID="$TELEGRAM_CHAT_ID"

send_telegram() {
  curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
       -d chat_id="$TELEGRAM_CHAT_ID" \
       -d parse_mode="Markdown" \
       -d text="$1"
}

send_telegram "*Deploy Started* – Beth's Pet Store is updating..."

if bash auto_deploy.sh >> "$LOG_FILE" 2>&1; then
    send_telegram "*Deploy Successful!* ✅\nNetlify: https://beths-pet-store.netlify.app"
else
    ERROR_LOG=$(tail -n 40 "$LOG_FILE")
    send_telegram "*Deploy Failed!* ❌\n\n\`\`\`\n$ERROR_LOG\n\`\`\`\nRun manually: cd '/storage/emulated/0/Download/Beths pet store' && bash auto_full.sh"
fi
