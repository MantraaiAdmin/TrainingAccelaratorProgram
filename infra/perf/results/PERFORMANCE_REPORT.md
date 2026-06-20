# Mantra.ai Performance Test Report

**Date:** 19 June 2026  
**Environment tested:** Production  
**Frontend:** https://mantraai.cloud (Vercel)  
**API:** https://mantra-learn-api.onrender.com/api/v1 (Render free tier + PostgreSQL)  
**Track under test:** `python-engineering-foundations` (Foundation Track: Python, Data & AI)  
**Test account:** `student@demo.com` (demo student)

---

## Executive Summary

| Area | Result | Grade |
|------|--------|-------|
| Frontend (Lighthouse) | Performance 88–96, LCP 2.5–3.5s | **Good** |
| API — single user (smoke) | All endpoints OK, 0% errors | **Good** |
| API — warm baseline (5-run avg) | Most endpoints &lt; 450ms | **Good** |
| API — 25 concurrent students | 0% errors, p95 latency 4.2s | **Acceptable** |
| API — health at 30 req/s | p95 258ms, 0% errors | **Excellent** |
| API — 15 concurrent logins | p95 ~41s (bcrypt bottleneck) | **Poor** |
| MoU scale (500 students) | Not validated at full scale | **Needs staging** |

**Overall verdict:** The application is **production-ready for a pilot cohort (≤50 concurrent active users)** with good frontend scores and stable API behavior under moderate load. **Login and track endpoints degrade significantly under concurrent load** on the current Render free-tier plan. Before a full college rollout (500 students), upgrade infrastructure and re-test.

---

## Test Methodology

### Tools installed & used
- **k6 v2.0.0** — API load, smoke, and stress tests
- **Lighthouse (npx)** — Frontend Core Web Vitals
- **Node benchmark script** — Sequential 5-run latency per endpoint

### Test suite (added to repo)
```
infra/perf/
├── 01-smoke.js              # 1 VU, 3 iterations — full student journey
├── 02-student-load.js       # Ramp 10→25 VUs, 3 min — browsing simulation
├── 03-health-stress.js      # 30 req/s for 1 min — health endpoint
├── 04-auth-load.js          # 15 VUs login for 1 min
├── benchmark-endpoints.mjs  # Sequential endpoint timing
├── lighthouse-run.sh        # Frontend audits
└── run-suite.sh             # Orchestrator
```

### Scenarios run
| # | Scenario | Duration | Max VUs | Requests |
|---|----------|----------|---------|----------|
| 1 | Smoke — full student flow | ~18s | 1 | 24 |
| 2 | Student browsing load | 3 min | 25 | 1,611 |
| 3 | Health stress | 1 min | 20 | 1,800 |
| 4 | Auth login load | 1 min | 15 | 30 |
| 5 | Endpoint benchmark | ~26s | 1 | 40 |
| 6 | Lighthouse (3 pages) | ~88s | — | — |

**Note:** Local stack was not running; all API tests targeted production Render. Frontend tests targeted Vercel production.

---

## 1. Smoke Test — Single User Journey

**Result: PASS** (all checks passed, 0% HTTP errors)

Simulates: login → health → dashboard → tracks list → track tree → lesson subsection → leaderboard → announcements.

| Metric | Value |
|--------|-------|
| Iterations | 3 |
| HTTP requests | 24 |
| Error rate | 0% |
| Avg response time | 632ms |
| p95 response time | 2.6s |
| Full journey time | ~6.1s / iteration |

**Per-endpoint (p95):**

| Endpoint | p95 |
|----------|-----|
| `GET /health` | 237ms |
| `GET /tracks/:slug` | 699ms |
| Other endpoints | &lt; 500ms typical |

---

## 2. Load Test — 25 Concurrent Students

**Result: PARTIAL PASS** (0% errors, latency thresholds exceeded)

Profile: Ramp 0→10 VUs (30s) → 25 VUs (2m) → ramp down. Each VU runs full browsing flow with 2–4s think time.

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Iterations completed | 229 | — | — |
| HTTP requests | 1,611 | — | — |
| Error rate | **0%** | &lt; 5% | ✅ |
| Overall p95 latency | **4.17s** | &lt; 3s | ❌ |
| `GET /tracks/:slug` p95 | **3.70s** | &lt; 4s | ✅ |
| `GET /tracks/subsection/:id` p95 | **2.02s** | &lt; 2s | ❌ (marginal) |
| Data transferred | 29 MB | — | — |
| Throughput | 8.6 req/s | — | — |

**Interpretation:** Functionality remains 100% correct under 25 concurrent users, but the **track tree endpoint becomes the bottleneck** (~103 KB payload × concurrent requests). Subsection fetches also slow to ~2s p95. Acceptable for a small class; not sufficient for 100+ simultaneous learners without caching or scaling.

---

## 3. Health Endpoint Stress — 30 req/s

**Result: PASS**

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Requests | 1,800 in 60s | — | — |
| Error rate | **0%** | &lt; 10% | ✅ |
| p95 latency | **258ms** | &lt; 1.5s | ✅ |
| Avg latency | 231ms | — | — |

The API health check handles **30 requests/second** without errors. Render instance stays responsive for lightweight probes.

---

## 4. Auth Login Load — 15 Concurrent Logins

**Result: FAIL (latency)**

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Login requests | 30 in 60s | — | — |
| Error rate | **0%** | &lt; 10% | ✅ |
| p95 login time | **41.1s** | &lt; 5s | ❌ |
| Median login time | 32.6s | — | — |

**Root cause:** bcrypt password hashing is CPU-intensive. On Render’s free tier (shared CPU), **15 simultaneous logins queue heavily**. This is the highest-risk scenario for college start-of-class “everyone logs in at once” events.

---

## 5. Endpoint Benchmark — Warm Server (5 runs each)

Sequential requests after warm-up (single user, no concurrency):

| Endpoint | Avg latency | Payload size | Status |
|----------|-------------|--------------|--------|
| `GET /health` | 324ms | 83 B | ✅ |
| `POST /auth/login` | **2,461ms** | 632 B | ⚠️ Slow (bcrypt) |
| `GET /progress/dashboard` | 418ms | 1.8 KB | ✅ |
| `GET /tracks` | 252ms | 846 B | ✅ |
| `GET /tracks/:slug` | 407ms | **105 KB** | ✅ |
| `GET /tracks/subsection/:id` | **240ms** | 13 KB | ✅ |
| `GET /gamification/leaderboard` | 228ms | 117 B | ✅ |
| `GET /announcements` | 228ms | 373 B | ✅ |

**Key insight:** Single-user performance is good. Login is inherently slow (~2.5s) due to bcrypt. Track tree is 105 KB — the D4 payload optimization (from ~1.7 MB) is working well.

---

## 6. Frontend — Lighthouse (Production)

Tested on https://mantraai.cloud (headless Chrome):

| Page | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|------|-------------|---------------|----------------|-----|-----|-----|-----|
| `/` (landing) | **88** | 88 | 96 | 100 | 3.5s | 0ms | 0 |
| `/login` | **95** | 88 | 96 | 100 | 2.6s | 40ms | 0 |
| `/dashboard`* | **96** | 88 | 96 | 100 | 2.5s | 50ms | 0 |

\* `/dashboard` and `/tracks` redirect unauthenticated Lighthouse to login-like content; scores reflect redirect target, not authenticated dashboard with live API data.

**Frontend verdict:** Strong scores. LCP on landing page (3.5s) is slightly above the 2.5s “good” threshold — acceptable for a marketing/redirect page. Login page performance is excellent.

---

## 7. Architecture Constraints Observed

| Constraint | Impact |
|------------|--------|
| Render **free tier** | Shared CPU, cold starts, login queue under load |
| Global rate limit **100 req/min/IP** | k6 from single IP would 429 at high VU counts (mitigated by think time in tests) |
| bcrypt login | ~2.5s single user, ~40s p95 under 15 concurrent |
| Track tree ~105 KB | Main bandwidth/latency driver under concurrent load |
| AI / code execution | Not tested (external Qwen + sandbox — excluded to avoid cost/abuse) |

---

## 8. MoU / Scale Readiness (500 Students)

| Target | Current status |
|--------|----------------|
| 50 concurrent browsing | ✅ Likely OK (0% errors at 25 VUs; extrapolate with caution) |
| 100 concurrent at class start (login) | ❌ Login p95 ~41s at 15 VUs |
| 500 registered users | ⚠️ Not load-tested; DB/API plan insufficient on free tier |
| Lesson content delivery | ✅ Subsection ~240ms warm; good UX |
| Frontend UX | ✅ Lighthouse 88–96 |

---

## 9. Recommendations (Priority Order)

### P0 — Before full college launch
1. **Upgrade Render** to Starter/Standard plan (always-on, more CPU) — eliminates cold starts and reduces login queue.
2. **Load-test login separately** after upgrade with 50–100 VUs simulating class start.
3. **Add Redis cache** for `GET /tracks/:slug` (architecture already Redis-ready per docs).

### P1 — Performance hardening
4. **Cache track tree** with short TTL (5–15 min) per user assignment.
5. **Consider bcrypt rounds** review (e.g. cost factor 10 vs 12) — balance security vs login speed.
6. **CDN cache** static curriculum metadata if it becomes identical across students.

### P2 — Ongoing monitoring
7. Add **k6 smoke test** to CI (5 VUs, 30s) against staging.
8. Enable **Render metrics + Vercel Analytics** for real-user monitoring.
9. Set alerts: API p95 &gt; 2s, error rate &gt; 1%, login p95 &gt; 5s.

### Not tested (future scope)
- AI chat streaming (`POST /ai/chat/stream`)
- Code execution (`POST /code/run`)
- Quiz submit under load
- Admin bulk student upload
- WebSocket (if enabled)

---

## 10. How to Re-run

```bash
cd "/Users/praveen/Documents/Constel AI NextGEN"

# Full suite (production API)
bash infra/perf/run-suite.sh

# Individual tests
k6 run infra/perf/01-smoke.js
k6 run infra/perf/02-student-load.js
node infra/perf/benchmark-endpoints.mjs
bash infra/perf/lighthouse-run.sh

# Against local API
API_URL=http://localhost:4000/api/v1 k6 run infra/perf/01-smoke.js
```

Raw logs and JSON summaries: `infra/perf/results/`

---

## Appendix: Test Artifacts

| File | Description |
|------|-------------|
| `results/20260619-004716-01-smoke-summary.json` | Smoke test metrics |
| `results/20260619-004716-02-student-load-summary.json` | 25 VU load test |
| `results/20260619-004716-03-health-stress-summary.json` | Health stress test |
| `results/20260619-004716-04-auth-load-summary.json` | Auth load test |
| `results/20260619-endpoint-benchmark-v2.log` | Warm endpoint timings |
| `results/20260619-lighthouse.log` | Frontend Lighthouse scores |

---

*Report generated from automated k6 + Lighthouse runs against production Mantra.ai infrastructure.*
