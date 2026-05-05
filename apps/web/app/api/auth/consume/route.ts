import { NextResponse } from 'next/server';
import { consumeMagicLink } from '@/lib/marketplace-api';
import { setSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/login?err=missing-token', req.url));
  }
  const out = await consumeMagicLink(token);
  if ('error' in out) {
    return NextResponse.redirect(new URL(`/login?err=${encodeURIComponent(out.error)}`, req.url));
  }
  if (out.kind === 'artist') {
    await setSession({ kind: 'artist', artistId: out.artistId, email: out.email });
  } else {
    await setSession({ kind: 'firm', firmId: out.firmId, email: out.email });
  }
  return NextResponse.redirect(new URL(out.redirect, req.url));
}
