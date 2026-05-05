import { NextResponse } from 'next/server';
import { declineBid } from '@/lib/marketplace-api';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: Promise<{ bidId: string }> }) {
  const { bidId } = await ctx.params;
  const session = await getSession();
  if (!session || session.kind !== 'artist') {
    return NextResponse.json({ error: 'artist session required' }, { status: 401 });
  }
  const bid = await store.getBid(bidId);
  if (!bid) return NextResponse.json({ error: 'bid not found' }, { status: 404 });
  const c = await store.getCase(bid.caseId);
  if (!c || c.artistId !== session.artistId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  await declineBid(bidId);
  return NextResponse.json({ ok: true });
}
