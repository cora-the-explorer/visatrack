import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const HANDLE_RE = /^[a-z0-9._]{1,30}$/;

const Body = z.object({
  ig_handle: z
    .string()
    .min(1)
    .max(40)
    .transform((s) => s.replace(/^@/, '').trim().toLowerCase()),
  email: z.string().email().optional(),
});

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_body', detail: String(err) },
      { status: 400 },
    );
  }

  const handle = parsed.ig_handle;
  if (!HANDLE_RE.test(handle)) {
    return NextResponse.json(
      { error: 'invalid_handle', detail: 'IG handle must be 1-30 chars: a-z, 0-9, dot, underscore' },
      { status: 400 },
    );
  }

  const supabase = getServerSupabase();
  const { data: lead, error } = await supabase
    .from('vt_leads')
    .insert({
      ig_handle: handle,
      email: parsed.email ?? null,
      tier: 'lite',
      status: 'scanning',
    })
    .select('id')
    .single();

  if (error || !lead) {
    console.error('[scan/start] lead insert failed', error);
    return NextResponse.json({ error: 'lead_insert_failed' }, { status: 500 });
  }

  // Fire-and-forget the scrape so the user can be redirected immediately.
  // We don't await — the /scan/[lead_id] page polls /api/scan/status.
  const origin = req.nextUrl.origin;
  void fetch(`${origin}/api/scan/run`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lead_id: lead.id }),
    // Next 15 prefers the server keep-alive; we don't read the body.
  }).catch((e) => console.error('[scan/start] kick scan/run failed', e));

  return NextResponse.json({ lead_id: lead.id, ig_handle: handle });
}
