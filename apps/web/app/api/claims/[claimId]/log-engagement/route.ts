import { NextResponse } from 'next/server';
import { logEngagement } from '@/lib/marketplace-api';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await ctx.params;
  const session = await getSession();
  if (!session || session.kind !== 'firm') {
    return NextResponse.json({ error: 'firm session required' }, { status: 401 });
  }
  const claim = await store.getClaim(claimId);
  if (!claim) return NextResponse.json({ error: 'claim not found' }, { status: 404 });
  if (claim.firmId !== session.firmId) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  try {
    const out = await logEngagement(claimId);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
