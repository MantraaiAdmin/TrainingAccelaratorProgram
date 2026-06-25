/** Canonical public URL for the student learning platform. */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || 'https://learn.mantraai.cloud'
).replace(/\/$/, '');

/** Official company marketing site — separate deployment from the learning app. */
export const MARKETING_URL = (
  process.env.NEXT_PUBLIC_MARKETING_URL || 'https://mantra.ai'
).replace(/\/$/, '');
