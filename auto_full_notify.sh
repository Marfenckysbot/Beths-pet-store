#!/bin/bash
set -e

SCRIPT="/storage/emulated/0/Download/Beths pet store/auto_full.sh"

bash ~/notify_telegram.sh "Deploy Started" "Beth's Pet Store is updating..."

if [ -f "$SCRIPT" ]; then
    bash "$SCRIPT"
    rc=$?
else
    rc=1
    echo "Error: $SCRIPT not found"
fi

if [ $rc -eq 0 ]; then
    bash ~/notify_telegram.sh "Deploy Success" "Deployment succeeded via GitHub remote build."
else
    bash ~/notify_telegram.sh "Deploy Failed" "Deployment failed. Exit code: $rc"
fi

exit $rc
