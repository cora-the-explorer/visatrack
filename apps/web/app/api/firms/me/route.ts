import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';

export const runtime = 'nodejs';

const schema = z.object({
  displayName: z.string().min(2).optional(),
  logoUrl: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  feePhilosophy: z.string().optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.kind !== 'firm') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const json = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid input', details: parsed.error.issues }, { status: 400 });
  }
  const updated = await store.updateFirm(session.firmId, parsed.data);
  return NextResponse.json({ ok: true, firm: updated });
}
