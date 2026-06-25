# Mantra.ai Load Test Report — July 1st Week Readiness (100 Students)

**Date:** 25 June 2026  
**Target event:** Internship program launch — **100 students** accessing in **1st week of July 2026**  
**Environment:** Production  
**Frontend:** https://mantraai.cloud (Vercel)  
**API:** https://mantra-learn-api.onrender.com/api/v1 (Render)  
**Track:** `python-engineering-foundations` (Foundation Track: Python, Data & AI)  
**Tool:** k6 v2.0.0  

---

## Executive Answer

| Question | Answer |
|----------|--------|
| **How many students can access the website at once?** | **Frontend (website): 100+** — Vercel CDN scales without issue. **Backend (lessons/API): ~50 comfortable, 100 possible but slow** on current Render plan. |
| **Is 100 students ready for July 1st week?** | **Partially.** Browsing/learning works for 100 concurrent users with **~99.98% success**, but pages feel **slow (p95 ~31s)**. **100 simultaneous logins fail badly** (~97% failure in burst test). |
| **Overall verdict** | **Pilot-ready with mitigations** — stagger logins, upgrade Render, cache track data. **Not ready** for “entire class logs in at once” on current infrastructure. |

---

## Architecture & Capacity Model

```
Student browser  →  mantraai.cloud (Vercel)     → scales to 1000s ✅
                 →  mantra-learn-api (Render)   → single instance bottleneck ⚠️
                 →  PostgreSQL (Render)          → not saturated in tests ✅
```

| Layer | Role | 100-student capacity |
|-------|------|----------------------|
| **Vercel (web)** | Next.js UI, static assets, auth proxy | **Excellent** — login page loads in ~1.2s |
| **Render API** | Lessons, progress, quizzes, auth | **Bottleneck** — CPU + single instance |
| **PostgreSQL** | User/progress data | **OK** — no DB errors observed |
| **bcrypt login** | Password verify on login | **Severe bottleneck** under concurrent auth |

**Per-student vs load-test note:** k6 ran all virtual users from **one machine (one public IP)**. Real students each use their own network IP. Rate-limit config exists in code (`100 req/min/IP`) but **ThrottlerGuard is not registered** — limits are **not currently enforced**. Real-world limits today are **Render CPU/memory**, not IP throttling.

---

## Tests Executed (25 June 2026)

| # | Scenario | Script | Max VUs | Duration | Purpose |
|---|----------|--------|---------|----------|---------|
| 1 | Smoke — single student journey | `01-smoke.js` | 1 | ~72s | Baseline health |
| 2 | **100 concurrent browsing** | `05-july-100-students.js` | **100** | **7 min** | July cohort using dashboard + lessons |
| 3 | **100 login burst** | `06-july-100-login-burst.js` | **100** | **4.5 min** | Class-start “everyone logs in together” |
| 4 | Post-test health check | curl | — | — | API recovery |

Raw artifacts: `infra/perf/results/20260625-231648-*`

---

## Test 1 — Smoke (1 user)

**Result: PASS**

| Metric | Value |
|--------|-------|
| HTTP errors | **0%** |
| Checks passed | **24/24 (100%)** |
| Avg response | 2.83s |
| p95 response | 2.55s |
| Full journey | ~6–24s per iteration (includes cold-start login spike up to 54s on first request) |

All endpoints returned 200: health, dashboard, tracks, track tree, subsection, leaderboard, announcements.

---

## Test 2 — 100 Concurrent Students Browsing ⭐ Primary July Test

**Simulates:** 100 students actively using the platform — dashboard → track list → track tree → lesson subsection → leaderboard → announcements, with 3–6s think time between cycles.

**Profile:** Ramp 25 → 50 → **100 VUs** over 3 min, hold 100 VUs for 3 min, ramp down.

### Results

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Max concurrent VUs | **100** | 100 | ✅ |
| Total HTTP requests | **4,219** | — | — |
| Throughput | **9.6 req/s** | — | — |
| **HTTP error rate** | **0.02%** (1 failure) | < 5% | ✅ |
| **Functional checks** | **99.97%** (4,218/4,219) | > 90% | ✅ |
| Completed browsing cycles | **580** | — | — |
| Data transferred | **75 MB** | — | — |

### Latency (user experience)

| Endpoint / metric | Avg | Median | p95 | Acceptable UX? |
|-------------------|-----|--------|-----|----------------|
| **Overall API** | 6.6s | 3.2s | **31.1s** | ❌ Slow at peak |
| `GET /tracks/:slug` (~105 KB) | 8.1s | 9.0s | **12.0s** | ⚠️ Track page slow |
| `GET /tracks/subsection/:id` | 4.4s | 4.8s | **7.8s** | ⚠️ Lesson load slow |
| Full browsing cycle | 49.9s | **62s** | 69s | ❌ Feels sluggish |

### Per-endpoint success (at 100 VUs)

| Check | Pass | Fail |
|-------|------|------|
| health 200 | 616 | 0 |
| dashboard 200 | 615 | 1 |
| tracks list 200 | 613 | 0 |
| track detail 200 | 599 | 0 |
| subsection 200 | 594 | 0 |
| leaderboard 200 | 592 | 0 |
| announcements 200 | 588 | 0 |

### Interpretation

- **Availability:** The platform **does not break** at 100 concurrent students — only **1 failed request** in 4,219.
- **Performance:** Response times **degrade significantly** at 100 VUs. Median full page cycle ~**1 minute**; worst cases hit **60s timeouts**.
- **Bottleneck:** `GET /tracks/:slug` (large ~105 KB JSON tree) under concurrent load on a **single Render CPU**.
- **Capacity estimate:** **~50 concurrent active students** is a safer comfort zone (prior 25-VU test showed p95 ~4s). **100 works but with poor UX** unless infrastructure is upgraded or track data is cached.

---

## Test 3 — 100 Simultaneous Logins (Class Start)

**Simulates:** First-period login when many students open mantraai.cloud at the same time.

**Profile:** Ramp to **100 VUs** over 2 min, sustain 100 VUs for 2 min.

### Results

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Login attempts | **1,705** | — | — |
| **Successful logins** | **57 (3.3%)** | > 95% | ❌ |
| **HTTP failure rate** | **96.65%** | < 15% | ❌ |
| Login p95 latency (all attempts) | **56.8s** | < 15s | ❌ |
| Successful login p95 | **57.1s** | — | ❌ |
| Rate-limited (429) | **0** | — | — |

### Root cause

1. **bcrypt** password hashing is CPU-heavy — 100 concurrent logins queue on one Render instance.
2. Many requests **timed out at 60s** or received **502** from Render under overload.
3. After this test, API health returned **502** for several minutes — instance overwhelmed.

### Real-world nuance

Each student logging in from their **own device** avoids single-IP artificial limits, but **still shares one API server CPU**. Expect **better than 3%** success in production (not all 100 hit login in the same second), but **simultaneous class login remains the highest-risk scenario**.

---

## Frontend (Website) Capacity

Post-test check:

| URL | HTTP | Load time |
|-----|------|-----------|
| https://mantraai.cloud/login | **200** | **1.17s** |
| API `/health` (after stress) | **502** | 0.70s |

**Website itself handles 100+ concurrent visitors.** The constraint is **API/backend**, not Vercel.

Prior Lighthouse scores (19 June): Performance **88–96**, LCP **2.5–3.5s** on login/landing pages.

---

## July 1st Week — Readiness Matrix

| Scenario | 100 students? | Confidence | Notes |
|----------|---------------|------------|-------|
| Students already logged in, browsing lessons | **Yes, with slow UX** | Medium | 99.98% API success; p95 latency high |
| Spread logins over 30–60 min | **Likely OK** | Medium | Avoids bcrypt pile-up |
| Entire class logs in within 5 min | **No** | High | 97% failure in burst test |
| Weekly quiz + lesson same hour | **Untested** | Low | Quiz submit not in scope |
| AI tutor + code run under load | **Untested** | Low | External services; higher cost |

---

## Recommended Capacity Guidelines

| Tier | Concurrent active students | Use case |
|------|---------------------------|----------|
| **Comfortable** | **40–50** | Smooth lesson browsing, acceptable p95 (< 5s) |
| **Maximum (current infra)** | **~100** | Functional but slow; plan for complaints |
| **Login burst (current infra)** | **≤ 15–20/min** | Stagger batches; avoid single bell-time login |
| **After Render upgrade + caching** | **100+** | Target for July launch |

---

## Action Plan Before July 1st Week

### P0 — Must do

1. **Upgrade Render** to Starter/Standard (always-on, more CPU) — eliminates cold starts and login queue collapse.
2. **Stagger student onboarding** — login in batches of 20 over 30–45 minutes on Day 1.
3. **Pre-provision accounts** — bulk upload before launch so students aren’t all hitting login + enrollment together.
4. **Re-run `05-july-100-students.js`** after upgrade to confirm p95 < 5s.

### P1 — Strongly recommended

5. **Cache `GET /tracks/:slug`** (Redis or CDN, 5–15 min TTL) — largest payload and top bottleneck.
6. **Register ThrottlerGuard** if per-IP limits are desired — config exists but guard is not wired.
7. **Warm API** before first class session (`GET /health` + admin ping 10 min before).
8. **Monitor Render** — alert on 5xx, p95 > 3s, instance restarts.

### P2 — Launch day playbook

9. TPO sends students **direct login link** + credentials before class.
10. First live session: **demo login on projector**, then students follow (not simultaneous).
11. Keep **support contact** ready for first 48 hours.
12. Schedule **load re-test** 3 days before cohort start.

---

## How to Re-run

```bash
cd "/Users/praveen/Documents/Constel AI NextGEN"

# 100-student browsing (July target)
k6 run infra/perf/05-july-100-students.js \
  -e API_URL=https://mantra-learn-api.onrender.com/api/v1

# 100 login burst (class start)
k6 run infra/perf/06-july-100-login-burst.js \
  -e API_URL=https://mantra-learn-api.onrender.com/api/v1

# Single-user smoke
k6 run infra/perf/01-smoke.js

# Full suite (includes older 25-VU test)
bash infra/perf/run-suite.sh
```

Results export to `infra/perf/results/` with `--summary-export`.

---

## Appendix — Test Artifacts

| File | Description |
|------|-------------|
| `20260625-231648-01-smoke-summary.json` | Smoke test metrics |
| `20260625-231648-05-july-100-students-summary.json` | **100 VU browsing test** |
| `20260625-231648-06-july-100-login-summary.json` | **100 VU login burst** |
| `20260625-231648-05-july-100-students.log` | Full k6 console output |
| `20260625-231648-06-july-100-login.log` | Full k6 console output |

---

*Proprietary — Mantra.ai · Load test report for July 2026 cohort readiness*
