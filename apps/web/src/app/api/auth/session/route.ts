import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'mantra-auth';
const MAX_AGE = 60 * 60 * 24 * 7;

const API_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://mantra-learn-api.onrender.com'
).replace(/\/$/, '');

function cookieOptions() {
  return {
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  };
}

async function verifyAccessToken(token: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return response.ok;
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const body = await request.json().catch(() => null);
  const token =
    authHeader?.replace(/^Bearer\s+/i, '').trim() ||
    (typeof body?.accessToken === 'string' ? body.accessToken : '');

  if (!token || !(await verifyAccessToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, '1', { ...cookieOptions(), maxAge: MAX_AGE });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, '', { ...cookieOptions(), maxAge: 0 });
  return response;
}
