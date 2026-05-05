import { NextResponse } from 'next/server';
import { finalizeCase } from '@/lib/marketplace-api';

export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await ctx.params;
  const c = await finalizeCase(caseId);
  if (!c) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true, status: c.status });
}
