import { NextResponse } from 'next/server';

// DEPRECATED — v2 claim model. The platform now chooses the firm by claim
// order, so artists no longer accept/decline bids.
export const runtime = 'nodejs';

const DEPRECATION = {
  error: 'gone',
  message:
    'POST /api/bids/[bidId]/accept was removed in the v2 claim model. ' +
    'The platform now chooses the firm by claim order — artists see a single chosen firm at /portal/firm.',
  migration: {
    from: 'POST /api/bids/:bidId/accept',
    to: 'no replacement — see GET /portal/firm',
    docs: '/docs/marketplace.md',
  },
} as const;

export async function POST(_req: Request) {
  return NextResponse.json(DEPRECATION, { status: 410 });
}
