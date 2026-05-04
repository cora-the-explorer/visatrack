import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const Query = z.object({ lead_id: z.string().uuid() });

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  let leadId: string;
  try {
    leadId = Query.parse({ lead_id: url.searchParams.get('lead_id') }).lead_id;
  } catch {
    return NextResponse.json({ error: 'invalid_lead_id' }, { status: 400 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('vt_leads')
    .select('id, ig_handle, status, evidence_score, gap_summary, error_message, created_at')
    .eq('id', leadId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'lead_not_found' }, { status: 404 });
  }

  let scan: unknown = null;
  if (data.status === 'scored') {
    const { data: scanRow } = await supabase
      .from('vt_evidence_scans')
      .select('normalized, raw_payload, created_at')
      .eq('lead_id', leadId)
      .eq('platform', 'instagram')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    scan = scanRow;
  }

  return NextResponse.json({
    lead: data,
    scan,
  });
}
