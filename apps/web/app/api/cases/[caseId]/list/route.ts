import { NextResponse } from 'next/server';
import { listCase, listCaseSchema } from '@/lib/marketplace-api';

export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await ctx.params;
  const json = await req.json().catch(() => ({}));
  const parsed = listCaseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input', details: parsed.error.issues }, { status: 400 });
  }
  try {
    const out = await listCase(caseId, parsed.data);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
