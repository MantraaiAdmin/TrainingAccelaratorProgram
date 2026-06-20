import http from 'k6/http';
import { check, sleep } from 'k6';

const apiUrl = __ENV.API_URL || 'https://mantra-learn-api.onrender.com/api/v1';
const email = __ENV.TEST_EMAIL || 'student@demo.com';
const password = __ENV.TEST_PASSWORD || 'Demo@123';

export const options = {
  vus: 15,
  duration: '1m',
  thresholds: {
    http_req_failed: ['rate<0.1'],
    'http_req_duration{name:POST /auth/login}': ['p(95)<5000'],
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
    'has token': (r) => !!r.json('accessToken'),
  });
  sleep(1);
}
