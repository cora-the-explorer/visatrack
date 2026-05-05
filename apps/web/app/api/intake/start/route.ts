import { NextResponse } from 'next/server';
import { intakeStart, intakeStartSchema } from '@/lib/marketplace-api';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = intakeStartSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input', details: parsed.error.issues }, { status: 400 });
  }
  const out = await intakeStart(parsed.data);
  return NextResponse.json({ ok: true, ...out });
}
