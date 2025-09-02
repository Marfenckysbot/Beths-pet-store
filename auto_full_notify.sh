#!/usr/bin/env bash
set -euo pipefail

# Path to the real script (auto_full.sh)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${SCRIPT_DIR}/auto_full.sh"
NOTIFY="${SCRIPT_DIR}/notify_telegram.sh"

# on_error: send failure message and exit with non-zero status
on_error() {
  rc=\$?
  if [ -x "\$NOTIFY" ]; then
    # send first 3000 chars of logfile or a short failure note
    \$NOTIFY "Deploy FAILED — Beth's Pet Store" "Exit code: \$rc\nLast command failed. Check logs and Netlify deploys."
  fi
  exit \$rc
}

# on_success: send success message
on_success() {
  if [ -x "\$NOTIFY" ]; then
    \$NOTIFY "Deploy SUCCESS — Beth's Pet Store" "Automated deploy finished successfully. Live: https://beths-pet-store.netlify.app"
  fi
}

trap 'on_error' ERR
trap 'on_success' EXIT

# Run the real automation script
bash "\$SCRIPT"
