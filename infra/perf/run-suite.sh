#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/infra/perf/results"
mkdir -p "$OUT"
TS="$(date +%Y%m%d-%H%M%S)"
API_URL="${API_URL:-https://mantra-learn-api.onrender.com/api/v1}"
WEB_URL="${WEB_URL:-https://mantraai.cloud}"

echo "=== Mantra.ai Performance Suite ==="
echo "API: $API_URL"
echo "Web: $WEB_URL"
echo "Output: $OUT"
echo ""

run_k6() {
  local name="$1"
  local script="$2"
  echo ">> Running $name..."
  k6 run "$script" \
    -e "API_URL=$API_URL" \
    --summary-export "$OUT/${TS}-${name}-summary.json" \
    2>&1 | tee "$OUT/${TS}-${name}.log"
  echo ""
}

run_k6 "01-smoke" "$ROOT/infra/perf/01-smoke.js"
run_k6 "02-student-load" "$ROOT/infra/perf/02-student-load.js"
run_k6 "03-health-stress" "$ROOT/infra/perf/03-health-stress.js"
run_k6 "04-auth-load" "$ROOT/infra/perf/04-auth-load.js"

echo ">> Running endpoint benchmark..."
bash "$ROOT/infra/perf/benchmark-endpoints.sh" | tee "$OUT/${TS}-endpoint-benchmark.log"

echo ">> Running Lighthouse (frontend)..."
bash "$ROOT/infra/perf/lighthouse-run.sh" | tee "$OUT/${TS}-lighthouse.log"

echo "Done. Results in $OUT"
