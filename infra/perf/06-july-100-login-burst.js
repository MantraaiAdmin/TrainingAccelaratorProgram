/**
 * July 1st week — class start login burst (100 students log in within ~2 minutes).
 * Simulates first-period login when cohort opens the platform together.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const apiUrl = __ENV.API_URL || 'https://mantra-learn-api.onrender.com/api/v1';
const email = __ENV.TEST_EMAIL || 'student@demo.com';
const password = __ENV.TEST_PASSWORD || 'Demo@123';

export const options = {
  scenarios: {
    class_start_login: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 25 },
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '20s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.15'],
    'http_req_duration{name:POST /auth/login}': ['p(95)<15000'],
    checks: ['rate>0.80'],
  },
};

export default function () {
  const res = http.post(
    `${apiUrl}/auth/login`,
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'POST /auth/login' },
    },
  );
  check(res, {
    'login ok': (r) => r.status === 200 || r.status === 201,
    'has token': (r) => {
      try {
        return !!r.json('accessToken');
      } catch {
        return false;
      }
    },
    'not rate limited': (r) => r.status !== 429,
  });
  sleep(Math.random() * 2 + 1);
}
