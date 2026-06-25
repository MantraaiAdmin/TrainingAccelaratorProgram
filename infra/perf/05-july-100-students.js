/**
 * July 1st week readiness — 100 concurrent student browsing simulation.
 * Target: 100 students actively using lessons, dashboard, track tree.
 */
import { sleep } from 'k6';
import { DEFAULTS, login, studentJourney } from './lib.js';

export const options = {
  scenarios: {
    july_cohort_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 25 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '3m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<8000'],
    'http_req_duration{name:GET /tracks/:slug}': ['p(95)<8000'],
    'http_req_duration{name:GET /tracks/subsection/:id}': ['p(95)<5000'],
    checks: ['rate>0.90'],
  },
};

const { apiUrl, email, password, trackSlug } = DEFAULTS;

export function setup() {
  const auth = login(apiUrl, email, password);
  return { headers: auth.headers };
}

export default function (data) {
  let headers = data.headers;
  if (!headers?.Authorization) {
    const auth = login(apiUrl, email, password);
    if (!auth.token) return;
    headers = auth.headers;
  }
  studentJourney(apiUrl, headers, trackSlug);
  sleep(Math.random() * 3 + 3);
}
