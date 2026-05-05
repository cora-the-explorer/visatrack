import { NextResponse } from 'next/server';
import { releaseClaim } from '@/lib/marketplace-api';
import { store } from '@/lib/store';

export const runtime = 'nodejs';

// Admin-only OR auto-callable when 7 days elapse without engagement.
// Auth: requires `Authorization: Bearer $ADMIN_TOKEN` (matches admin
// firm-approve route convention) — the in-process tick handles the auto path
// without hitting this endpoint.
export async function POST(req: Request, ctx: { params: Promise<{ claimId: string }> }) {
  const { claimId } = await ctx.params;
  const adminToken = process.env.ADMIN_TOKEN || 'dev-admin';
  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${adminToken}`) {
    return NextResponse.json({ error: 'admin token required' }, { status: 401 });
  }
  const claim = await store.getClaim(claimId);
  if (!claim) return NextResponse.json({ error: 'claim not found' }, { status: 404 });
  const json = (await req.json().catch(() => ({}))) as { reason?: string };
  try {
    const out = await releaseClaim(claimId, json.reason);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
