import { NextRequest, NextResponse } from 'next/server';
import { directLogin } from '@/lib/direct-auth';

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

function loginResponse(data: unknown) {
  const response = NextResponse.json(data);
  response.cookies.set(AUTH_COOKIE, '1', { ...cookieOptions(), maxAge: MAX_AGE });
  return response;
}

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string } | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  if (!body?.email || !body?.password) {
    return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
  }

  // Prefer direct DB auth on Vercel when DATABASE_URL + JWT_SECRET are configured.
  // This keeps login working even if Render API is stale or failing.
  try {
    const direct = await directLogin(body.email, body.password);
    if (direct === 'invalid') {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    if (direct) {
      return loginResponse(direct);
    }
  } catch (error) {
    console.error('[auth/login] direct DB login failed:', error);
    return NextResponse.json(
      { message: 'Authentication database error. Please contact support.' },
      { status: 503 },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: body.email, password: body.password }),
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    return NextResponse.json(
      { message: 'Authentication service is temporarily unavailable. Please try again.' },
      { status: 503 },
    );
  }

  const data = await upstream.json().catch(() => ({ message: 'Login failed' }));
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  return loginResponse(data);
}
