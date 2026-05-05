import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  await clearSession();
  return NextResponse.redirect(new URL('/', req.url), { status: 303 });
}

export async function GET(req: Request) {
  await clearSession();
  return NextResponse.redirect(new URL('/', req.url));
}
