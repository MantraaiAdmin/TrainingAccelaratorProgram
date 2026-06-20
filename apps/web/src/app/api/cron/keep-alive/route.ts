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
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/health`, { cache: 'no-store' });
    return NextResponse.json({ ok: response.ok, status: response.status });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
