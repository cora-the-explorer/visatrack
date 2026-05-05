import { NextResponse } from 'next/server';
import { approveFirm } from '@/lib/marketplace-api';

export const runtime = 'nodejs';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const adminToken = process.env.ADMIN_TOKEN || 'dev-admin';
  const auth = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (auth !== adminToken) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const out = await approveFirm(id);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
