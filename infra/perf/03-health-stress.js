import http from 'k6/http';
import { check } from 'k6';

const apiUrl = __ENV.API_URL || 'https://mantra-learn-api.onrender.com/api/v1';

export const options = {
  scenarios: {
    health_probe: {
      executor: 'constant-arrival-rate',
      rate: 30,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 20,
      maxVUs: 50,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.1'],
    'http_req_duration{name:GET /health}': ['p(95)<1500'],
  },
};

export default function () {
  const res = http.get(`${apiUrl}/health`, { tags: { name: 'GET /health' } });
  check(res, { 'health ok': (r) => r.status === 200 });
}
