import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getApiBaseUrl(): string {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'https://mantra-learn-api.onrender.com'
  ).replace(/\/$/, '');
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }
  } else {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/health`, { cache: 'no-store' });
    return NextResponse.json({ ok: response.ok, status: response.status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
