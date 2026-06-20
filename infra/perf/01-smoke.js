import { sleep } from 'k6';
import { DEFAULTS, login, studentJourney } from './lib.js';

export const options = {
  vus: 1,
  iterations: 3,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    'http_req_duration{name:GET /health}': ['p(95)<2000'],
    'http_req_duration{name:GET /tracks/:slug}': ['p(95)<5000'],
  },
};

const { apiUrl, email, password, trackSlug } = DEFAULTS;

export default function () {
  const auth = login(apiUrl, email, password);
  if (!auth.token) return;
  studentJourney(apiUrl, auth.headers, trackSlug);
  sleep(1);
}
