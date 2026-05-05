import { NextResponse } from 'next/server';
import { firmApply, firmApplySchema } from '@/lib/marketplace-api';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = firmApplySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input', details: parsed.error.issues }, { status: 400 });
  }
  try {
    const out = await firmApply(parsed.data);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
