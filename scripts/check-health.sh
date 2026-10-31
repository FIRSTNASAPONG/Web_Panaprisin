#!/usr/bin/env bash
# Read-only health probes. Never deploys, restarts or updates deployment state.
set -euo pipefail
if [[ $# -ne 1 || ! "$1" =~ ^https?://[^[:space:]]+$ ]]; then
  echo 'Usage: bash scripts/check-health.sh http(s)://host[:port]' >&2
  exit 2
fi
base_url=${1%/}
attempts=${HEALTH_ATTEMPTS:-30}
delay=${HEALTH_DELAY_SECONDS:-3}
[[ "$attempts" =~ ^[1-9][0-9]*$ && "$attempts" -le 30 ]] || exit 2
[[ "$delay" =~ ^[0-9]+$ && "$delay" -le 30 ]] || exit 2
check_endpoint() {
  local label=$1 url=$2 attempt code curl_status
  for ((attempt=1; attempt<=attempts; attempt++)); do
    curl_status=0
    # Explicit --url argument; quoted URL is never interpreted as shell options.
    # No redirects, insecure TLS, eval, or swallowed curl failures.
    code=$(curl --disable --silent --show-error --output /dev/null --write-out '%{http_code}' \
      --connect-timeout 5 --max-time 10 --proto '=http,https' --url "$url") || curl_status=$?
    if [[ "$curl_status" -eq 0 && "$code" == 200 ]]; then
      printf 'PASS: %s (HTTP 200)\n' "$label"
      return 0
    fi
    printf 'WAIT: %s attempt %s/%s curl=%s HTTP=%s\n' "$label" "$attempt" "$attempts" "$curl_status" "${code:-000}" >&2
    # Invocation/configuration errors will not improve after retrying.
    if [[ "$curl_status" -eq 2 || "$curl_status" -eq 3 ]]; then return 1; fi
    if (( attempt < attempts )); then sleep "$delay"; fi
  done
  printf 'FAIL: %s\n' "$label" >&2
  return 1
}
failed=0
check_endpoint 'Laravel' "$base_url/up" || failed=1
check_endpoint 'Products API' "$base_url/api/products" || failed=1
check_endpoint 'Frontend' "$base_url/" || failed=1
exit "$failed"
