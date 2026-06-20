#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/infra/perf/results"
mkdir -p "$OUT"
TS="$(date +%Y%m%d-%H%M%S)"
WEB_URL="${WEB_URL:-https://mantraai.cloud}"

echo "=== Lighthouse Frontend Audit ==="
echo "Target: $WEB_URL"
echo ""

PAGES=(
  "/"
  "/login"
  "/dashboard"
  "/tracks"
)

for path in "${PAGES[@]}"; do
  slug="${path//\//-}"
  slug="${slug:-home}"
  echo ">> Lighthouse: $WEB_URL$path"
  npx --yes lighthouse "$WEB_URL$path" \
    --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags="--headless --no-sandbox --disable-gpu" \
    --output=json \
    --output-path="$OUT/${TS}-lh${slug}.json" \
    --quiet 2>/dev/null || echo "  (skipped — page may redirect without auth: $path)"

  if [[ -f "$OUT/${TS}-lh${slug}.json" ]]; then
    python3 - <<PY
import json
with open("$OUT/${TS}-lh${slug}.json") as f:
    r=json.load(f)
cats=r.get("categories",{})
print("  Performance:", round(cats.get("performance",{}).get("score",0)*100))
print("  Accessibility:", round(cats.get("accessibility",{}).get("score",0)*100))
print("  Best Practices:", round(cats.get("best-practices",{}).get("score",0)*100))
print("  SEO:", round(cats.get("seo",{}).get("score",0)*100))
metrics=r.get("audits",{})
for k in ["first-contentful-paint","largest-contentful-paint","total-blocking-time","cumulative-layout-shift","speed-index"]:
    a=metrics.get(k,{})
    if a.get("displayValue"):
        print(f"  {k}: {a['displayValue']}")
PY
    echo ""
  fi
done
