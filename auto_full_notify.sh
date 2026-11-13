#!/usr/bin/env bash
set -euo pipefail

echo "This legacy notification/deployment wrapper is disabled. Production deployment must use a reviewed pull request and explicit founder approval." >&2
exit 1
