import { sleep } from 'k6';
import { DEFAULTS, login, studentJourney } from './lib.js';

export const options = {
  scenarios: {
    student_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '2m', target: 25 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '15s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
    'http_req_duration{name:GET /tracks/:slug}': ['p(95)<4000'],
    'http_req_duration{name:GET /tracks/subsection/:id}': ['p(95)<2000'],
  },
};

const { apiUrl, email, password, trackSlug } = DEFAULTS;

export function setup() {
  const auth = login(apiUrl, email, password);
  return { headers: auth.headers };
}

export default function (data) {
  if (!data.headers?.Authorization) {
    const auth = login(apiUrl, email, password);
    if (!auth.token) return;
    studentJourney(apiUrl, auth.headers, trackSlug);
  } else {
    studentJourney(apiUrl, data.headers, trackSlug);
  }
  sleep(Math.random() * 2 + 2);
}
