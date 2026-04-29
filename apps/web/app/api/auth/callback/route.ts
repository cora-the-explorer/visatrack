import { NextResponse } from 'next/server';

// WorkOS AuthKit callback — wire up @workos-inc/authkit-nextjs handler here.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login', req.url));
  // TODO: exchange code, set session cookie, redirect.
  return NextResponse.redirect(new URL('/pipeline', req.url));
}
