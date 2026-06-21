import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'mantra-auth';
const MAX_AGE = 60 * 60 * 24 * 7;

function cookieOptions() {
  return {
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  };
}

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, '1', { ...cookieOptions(), maxAge: MAX_AGE });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, '', { ...cookieOptions(), maxAge: 0 });
  return response;
}
