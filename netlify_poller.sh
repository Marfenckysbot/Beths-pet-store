#!/usr/bin/env bash
set -e

# Requires env:
# NETLIFY_AUTH_TOKEN  (create in Netlify user settings)
# NETLIFY_SITE_ID     (from Netlify site settings)
# BRANCH (optional, defaults to main)
TOKEN="${NETLIFY_AUTH_TOKEN:-}"
SITE="${NETLIFY_SITE_ID:-}"
BRANCH="${BRANCH:-main}"
NOTIFY_SCRIPT="./notify_telegram.sh"

if [ -z "$TOKEN" ] || [ -z "$SITE" ]; then
  echo "Set NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID in env (export NETLIFY_AUTH_TOKEN=... ; export NETLIFY_SITE_ID=...)"
  exit 2
fi

echo "Polling Netlify for latest deploy on branch: $BRANCH (site: $SITE)"

# get latest deploy for the branch
deploy_json=$(curl -s -H "Authorization: Bearer $TOKEN" "https://api.netlify.com/api/v1/sites/$SITE/deploys?branch=$BRANCH&per_page=1")
deploy_id=$(echo "$deploy_json" | jq -r '.[0].id')
if [ -z "$deploy_id" ] || [ "$deploy_id" = "null" ]; then
  echo "No deploy found for branch $BRANCH"
  exit 1
fi

echo "Found deploy: $deploy_id. Polling status..."
while true; do
  d=$(curl -s -H "Authorization: Bearer $TOKEN" "https://api.netlify.com/api/v1/deploys/$deploy_id")
  state=$(echo "$d" | jq -r '.state')
  deploy_url=$(echo "$d" | jq -r '.deploy_ssl_url // .deploy_url // .url')
  started_at=$(echo "$d" | jq -r '.created_at')
  echo "State: $state"
  if [ "$state" = "ready" ]; then
    if [ -x "$NOTIFY_SCRIPT" ]; then
      "$NOTIFY_SCRIPT" "Netlify Deploy Succeeded" "Site: $deploy_url\nDeploy ID: $deploy_id\nStarted: $started_at\nStatus: ready"
    fi
    exit 0
  elif [ "$state" = "error" ]; then
    # grab logs snippet and notify
    logs=$(echo "$d" | jq -r '.error_message // .summary // "No error message"')
    if [ -x "$NOTIFY_SCRIPT" ]; then
      "$NOTIFY_SCRIPT" "Netlify Deploy FAILED" "Site: $deploy_url\nDeploy ID: $deploy_id\nStarted: $started_at\nError: $logs"
    fi
    exit 1
  else
    sleep 6
  fi
done
