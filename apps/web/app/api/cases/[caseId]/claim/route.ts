import { NextResponse } from 'next/server';
import { claimCase, claimCaseSchema } from '@/lib/marketplace-api';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(_req: Request, ctx: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await ctx.params;
  const session = await getSession();
  if (!session || session.kind !== 'firm') {
    return NextResponse.json({ error: 'firm session required' }, { status: 401 });
  }
  const parsed = claimCaseSchema.safeParse({ firmId: session.firmId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid input', details: parsed.error.issues },
      { status: 400 },
    );
  }
  try {
    const out = await claimCase(caseId, parsed.data);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
