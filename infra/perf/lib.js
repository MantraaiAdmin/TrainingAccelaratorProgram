import http from 'k6/http';
import { check } from 'k6';

export const DEFAULTS = {
  apiUrl: __ENV.API_URL || 'https://mantra-learn-api.onrender.com/api/v1',
  email: __ENV.TEST_EMAIL || 'student@demo.com',
  password: __ENV.TEST_PASSWORD || 'Demo@123',
  trackSlug: __ENV.TRACK_SLUG || 'python-engineering-foundations',
};

export function login(baseUrl, email, password) {
  const res = http.post(
    `${baseUrl}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /auth/login' } },
  );
  check(res, { 'login status 200/201': (r) => r.status === 200 || r.status === 201 });
  const token = res.json('accessToken');
  return {
    token,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

export function firstSubsectionId(trackBody) {
  const modules = trackBody?.modules || [];
  for (const mod of modules) {
    for (const chapter of mod.chapters || []) {
      const sub = (chapter.subsections || [])[0];
      if (sub?.id) return sub.id;
    }
  }
  return null;
}

export function studentJourney(baseUrl, headers, trackSlug) {
  const results = {};

  results.health = http.get(`${baseUrl}/health`, { tags: { name: 'GET /health' } });
  check(results.health, { 'health 200': (r) => r.status === 200 });

  results.dashboard = http.get(`${baseUrl}/progress/dashboard`, {
    headers,
    tags: { name: 'GET /progress/dashboard' },
  });
  check(results.dashboard, { 'dashboard 200': (r) => r.status === 200 });

  results.tracks = http.get(`${baseUrl}/tracks`, {
    headers,
    tags: { name: 'GET /tracks' },
  });
  check(results.tracks, { 'tracks list 200': (r) => r.status === 200 });

  results.track = http.get(`${baseUrl}/tracks/${trackSlug}`, {
    headers,
    tags: { name: 'GET /tracks/:slug' },
  });
  check(results.track, { 'track detail 200': (r) => r.status === 200 });

  const subId = firstSubsectionId(results.track.json());
  if (subId) {
    results.subsection = http.get(`${baseUrl}/tracks/subsection/${subId}`, {
      headers,
      tags: { name: 'GET /tracks/subsection/:id' },
    });
    check(results.subsection, { 'subsection 200': (r) => r.status === 200 });
  }

  results.leaderboard = http.get(`${baseUrl}/gamification/leaderboard`, {
    headers,
    tags: { name: 'GET /gamification/leaderboard' },
  });
  check(results.leaderboard, { 'leaderboard 200': (r) => r.status === 200 });

  results.announcements = http.get(`${baseUrl}/announcements`, {
    headers,
    tags: { name: 'GET /announcements' },
  });
  check(results.announcements, { 'announcements 200': (r) => r.status === 200 });

  return results;
}
