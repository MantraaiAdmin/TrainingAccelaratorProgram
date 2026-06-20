#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-https://mantra-learn-api.onrender.com/api/v1}"
EMAIL="${TEST_EMAIL:-student@demo.com}"
PASSWORD="${TEST_PASSWORD:-Demo@123}"
TRACK_SLUG="${TRACK_SLUG:-python-engineering-foundations}"

bench() {
  local label="$1"
  local url="$2"
  local extra="${3:-}"
  local total=0
  local ok=0
  local sizes=()
  for i in 1 2 3 4 5; do
    if [[ -n "$extra" ]]; then
      read -r code time size <<< "$(curl -s -o /tmp/perf-body.json -w "%{http_code} %{time_total} %{size_download}" $extra "$url")"
    else
      read -r code time size <<< "$(curl -s -o /tmp/perf-body.json -w "%{http_code} %{time_total} %{size_download}" "$url")"
    fi
    total=$(echo "$total + $time" | bc)
    sizes+=("$size")
    if [[ "$code" == "200" || "$code" == "201" ]]; then ok=$((ok + 1)); fi
    echo "  run $i: http=$code time=${time}s size=${size}B"
  done
  avg=$(echo "scale=3; $total / 5" | bc)
  last_size="${sizes[4]:-0}"
  echo "  => $label avg=${avg}s success=$ok/5 last_size=${last_size}B"
  echo ""
}

echo "=== Endpoint Benchmark (5 runs each) ==="
echo "Target: $API_URL"
echo ""

bench "GET /health" "$API_URL/health"

LOGIN_JSON=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
TOKEN=$(echo "$LOGIN_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('accessToken',''))" 2>/dev/null || true)

if [[ -z "$TOKEN" ]]; then
  echo "Login failed — skipping authenticated endpoints"
  exit 1
fi

AUTH=(-H "Authorization: Bearer $TOKEN")

bench "POST /auth/login" "$API_URL/auth/login" "-X POST -H Content-Type: application/json -d {\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
bench "GET /progress/dashboard" "$API_URL/progress/dashboard" "${AUTH[*]}"
bench "GET /tracks" "$API_URL/tracks" "${AUTH[*]}"
bench "GET /tracks/:slug" "$API_URL/tracks/$TRACK_SLUG" "${AUTH[*]}"

SUB_ID=$(python3 -c "
import json
with open('/tmp/perf-body.json') as f:
    d=json.load(f)
for m in d.get('modules',[]):
  for c in m.get('chapters',[]):
    subs=c.get('subsections',[])
    if subs:
      print(subs[0]['id']); raise SystemExit
" 2>/dev/null || true)

if [[ -n "$SUB_ID" ]]; then
  bench "GET /tracks/subsection/:id" "$API_URL/tracks/subsection/$SUB_ID" "${AUTH[*]}"
fi

bench "GET /gamification/leaderboard" "$API_URL/gamification/leaderboard" "${AUTH[*]}"
bench "GET /announcements" "$API_URL/announcements" "${AUTH[*]}"
