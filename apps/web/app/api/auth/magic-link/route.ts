import { NextResponse } from 'next/server';
import { z } from 'zod';
import { issueMagicLink } from '@/lib/marketplace-api';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email(),
  role: z.enum(['artist', 'firm', 'admin']),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input', details: parsed.error.issues }, { status: 400 });
  }
  const url = await issueMagicLink({ email: parsed.data.email, role: parsed.data.role });
  return NextResponse.json({ ok: true, magicLink: url });
}
