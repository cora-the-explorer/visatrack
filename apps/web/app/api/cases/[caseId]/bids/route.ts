import { NextResponse } from 'next/server';

// DEPRECATED — v2 claim model. Bid submission has been replaced by the
// flat-fee claim flow. See POST /api/cases/[caseId]/claim.
export const runtime = 'nodejs';

const DEPRECATION = {
  error: 'gone',
  message:
    'POST /api/cases/[caseId]/bids was removed in the v2 claim model. ' +
    'Use POST /api/cases/[caseId]/claim — first eligible firm wins a flat unlock fee and 7-day exclusive engagement.',
  migration: {
    from: 'POST /api/cases/:caseId/bids',
    to: 'POST /api/cases/:caseId/claim',
    docs: '/docs/marketplace.md',
  },
} as const;

export async function POST(_req: Request) {
  return NextResponse.json(DEPRECATION, { status: 410 });
}
