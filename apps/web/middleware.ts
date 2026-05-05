import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'vt_session';

type Session =
  | { kind: 'artist'; artistId: string; email: string }
  | { kind: 'firm'; firmId: string; email: string };

function readSession(req: NextRequest): Session | null {
  const raw = req.cookies.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Session;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const session = readSession(req);

  // Portal — artist only
  if (pathname.startsWith('/portal')) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?role=artist&next=${encodeURIComponent(pathname)}`, req.url),
      );
    }
    if (session.kind !== 'artist') {
      return NextResponse.redirect(new URL('/marketplace', req.url));
    }
  }

  // Marketplace + cases + settings (firm console) — firm only
  const FIRM_PREFIXES = ['/marketplace', '/cases', '/settings', '/pipeline', '/inbox'];
  if (FIRM_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?role=firm&next=${encodeURIComponent(pathname)}`, req.url),
      );
    }
    if (session.kind !== 'firm') {
      return NextResponse.redirect(new URL('/portal', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/portal/:path*',
    '/marketplace/:path*',
    '/cases/:path*',
    '/settings/:path*',
    '/pipeline/:path*',
    '/inbox/:path*',
  ],
};
