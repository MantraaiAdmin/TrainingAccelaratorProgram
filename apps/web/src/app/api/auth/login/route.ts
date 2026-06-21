import { NextRequest, NextResponse } from 'next/server';

const API_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://mantra-learn-api.onrender.com'
).replace(/\/$/, '');

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

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
  }

  const upstream = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const data = await upstream.json().catch(() => ({ message: 'Login failed' }));
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const response = NextResponse.json(data);
  response.cookies.set(AUTH_COOKIE, '1', { ...cookieOptions(), maxAge: MAX_AGE });
  return response;
}
