#!/bin/sh
set -eu
base="${1:-http://127.0.0.1:8080}"
curl --fail --silent --show-error "$base/healthz" >/dev/null
curl --fail --silent --show-error "$base/" | grep -q '<div id="root"></div>'
printf 'preview healthy: %s\n' "$base"
