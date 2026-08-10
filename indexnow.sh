#!/usr/bin/env bash
# indexnow.sh - submit URLs to IndexNow (Bing, Yandex, Seznam, Naver, Yep).
#
# Usage:
#   ./indexnow.sh                      Submit every <loc> in sitemap.xml
#   ./indexnow.sh /about.html /faq.html   Submit only the named paths
#
# Requires: curl, jq
#
# The API key is never hardcoded. Supply it one of two ways:
#   1. export INDEXNOW_KEY=xxxxxxxx
#   2. put the key (and nothing else) in .indexnow-key  (gitignored)
#
# HTTP response codes:
#   200 OK                  URLs received and validated. Nothing further to do.
#   202 Accepted            URLs received; key validation still pending. Normal
#                           on the first submission after publishing a new key.
#   400 Bad Request         Malformed JSON, bad URL format, or empty urlList.
#   403 Forbidden           Key not found at keyLocation, or its contents do not
#                           match the key in the payload. Fetch the key file in a
#                           browser and confirm it returns 200 text/plain.
#   422 Unprocessable       URLs do not belong to `host`, or the key does not
#                           match the host. Check for www vs apex mismatch.
#   429 Too Many Requests   Submitting too often. Batch changes; do not loop.
set -euo pipefail

HOST="skyviewfg.com"
ORIGIN="https://${HOST}"
SITEMAP="$(dirname "$0")/sitemap.xml"
ENDPOINT="https://api.indexnow.org/IndexNow"

# --- resolve the key --------------------------------------------------------
KEY="${INDEXNOW_KEY:-}"
if [[ -z "$KEY" && -f "$(dirname "$0")/.indexnow-key" ]]; then
  KEY="$(tr -d '[:space:]' < "$(dirname "$0")/.indexnow-key")"
fi
if [[ -z "$KEY" ]]; then
  echo "ERROR: no key. Set INDEXNOW_KEY or create .indexnow-key" >&2
  exit 1
fi
KEY_LOCATION="${ORIGIN}/${KEY}.txt"

# --- build the URL list -----------------------------------------------------
if [[ $# -gt 0 ]]; then
  URLS=()
  for p in "$@"; do
    [[ "$p" == http* ]] && URLS+=("$p") || URLS+=("${ORIGIN}${p}")
  done
else
  [[ -f "$SITEMAP" ]] || { echo "ERROR: $SITEMAP not found" >&2; exit 1; }
  mapfile -t URLS < <(grep -oE '<loc>[^<]+</loc>' "$SITEMAP" | sed -E 's#</?loc>##g')
fi

if [[ ${#URLS[@]} -eq 0 ]]; then
  echo "Nothing to submit."
  exit 0
fi

PAYLOAD="$(jq -n \
  --arg host "$HOST" \
  --arg key "$KEY" \
  --arg keyLocation "$KEY_LOCATION" \
  --args '{host:$host, key:$key, keyLocation:$keyLocation, urlList:$ARGS.positional}' \
  "${URLS[@]}")"

echo "Submitting ${#URLS[@]} URL(s) to IndexNow..."
STATUS="$(curl -sS -o /tmp/indexnow.out -w '%{http_code}' \
  -X POST "$ENDPOINT" \
  -H 'Content-Type: application/json; charset=utf-8' \
  --data-raw "$PAYLOAD")"

echo "HTTP $STATUS"
[[ -s /tmp/indexnow.out ]] && cat /tmp/indexnow.out
case "$STATUS" in
  200|202) exit 0 ;;
  *) exit 1 ;;
esac
