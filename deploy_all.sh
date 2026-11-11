#!/usr/bin/env bash
set -euo pipefail

cat >&2 <<'NOTICE'
This legacy deployment helper is intentionally disabled.

It previously pushed directly to the production "main" branch and/or triggered
a production Netlify deployment. Use the reviewed GitHub pull-request workflow
instead. Do not deploy production until the founder explicitly approves it.
NOTICE

exit 1
