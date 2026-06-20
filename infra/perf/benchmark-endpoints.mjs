#!/usr/bin/env node
/**
 * Sequential endpoint latency benchmark (5 runs each).
 * Usage: node infra/perf/benchmark-endpoints.mjs
 */
const API = process.env.API_URL || 'https://mantra-learn-api.onrender.com/api/v1';
const EMAIL = process.env.TEST_EMAIL || 'student@demo.com';
const PASSWORD = process.env.TEST_PASSWORD || 'Demo@123';
const TRACK_SLUG = process.env.TRACK_SLUG || 'python-engineering-foundations';

async function timedFetch(label, url, options = {}) {
  const runs = [];
  for (let i = 1; i <= 5; i++) {
    const start = performance.now();
    const res = await fetch(url, options);
    const body = await res.arrayBuffer();
    const ms = performance.now() - start;
    runs.push({ i, status: res.status, ms, bytes: body.byteLength });
    console.log(`  run ${i}: http=${res.status} time=${(ms / 1000).toFixed(3)}s size=${body.byteLength}B`);
  }
  const ok = runs.filter((r) => r.status >= 200 && r.status < 300).length;
  const avg = runs.reduce((s, r) => s + r.ms, 0) / runs.length;
  console.log(`  => ${label} avg=${(avg / 1000).toFixed(3)}s success=${ok}/5 last_size=${runs[4].bytes}B\n`);
  return { runs, avg, ok, lastBody: runs[4] };
}

async function main() {
  console.log('=== Endpoint Benchmark (5 runs each) ===');
  console.log(`Target: ${API}\n`);

  await timedFetch('GET /health', `${API}/health`);

  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.accessToken;
  if (!token) {
    console.error('Login failed:', loginJson);
    process.exit(1);
  }
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  await timedFetch('POST /auth/login', `${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  await timedFetch('GET /progress/dashboard', `${API}/progress/dashboard`, auth);
  await timedFetch('GET /tracks', `${API}/tracks`, auth);
  const track = await timedFetch('GET /tracks/:slug', `${API}/tracks/${TRACK_SLUG}`, auth);

  const trackRes = await fetch(`${API}/tracks/${TRACK_SLUG}`, auth);
  const trackData = await trackRes.json();
  let subId = null;
  for (const mod of trackData.modules || []) {
    for (const ch of mod.chapters || []) {
      if (ch.subsections?.[0]?.id) {
        subId = ch.subsections[0].id;
        break;
      }
    }
    if (subId) break;
  }

  if (subId) {
    await timedFetch('GET /tracks/subsection/:id', `${API}/tracks/subsection/${subId}`, auth);
  }

  await timedFetch('GET /gamification/leaderboard', `${API}/gamification/leaderboard`, auth);
  await timedFetch('GET /announcements', `${API}/announcements`, auth);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
