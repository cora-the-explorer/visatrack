import { NextResponse } from 'next/server';

// DEPRECATED — v2 claim model. See accept/route.ts for migration notes.
export const runtime = 'nodejs';

const DEPRECATION = {
  error: 'gone',
  message:
    'POST /api/bids/[bidId]/decline was removed in the v2 claim model. ' +
    'Artists no longer accept/decline — the platform chooses the firm by claim order.',
  migration: {
    from: 'POST /api/bids/:bidId/decline',
    to: 'no replacement — see GET /portal/firm',
    docs: '/docs/marketplace.md',
  },
} as const;

export async function POST(_req: Request) {
  return NextResponse.json(DEPRECATION, { status: 410 });
}
