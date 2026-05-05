import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { InstagramScraperError, scrapeProfile } from '@/lib/scraper/instagram';
import { getServerSupabase } from '@/lib/supabase/server';
import { scoreEvidence } from '@/lib/scoring';

export const runtime = 'nodejs';
export const maxDuration = 120;

const Body = z.object({ lead_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  let leadId: string;
  try {
    leadId = Body.parse(await req.json()).lead_id;
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_body', detail: String(err) },
      { status: 400 },
    );
  }

  const supabase = getServerSupabase();

  const { data: lead, error: leadErr } = await supabase
    .from('vt_leads')
    .select('id, ig_handle, status')
    .eq('id', leadId)
    .single();

  if (leadErr || !lead) {
    return NextResponse.json(
      { error: 'lead_not_found', detail: leadErr?.message },
      { status: 404 },
    );
  }

  await supabase
    .from('vt_leads')
    .update({ status: 'scanning', error_message: null })
    .eq('id', leadId);

  try {
    const profile = await scrapeProfile(lead.ig_handle);
    const { evidenceScore, normalized, gap } = scoreEvidence(profile);

    const { error: scanErr } = await supabase.from('vt_evidence_scans').insert({
      lead_id: leadId,
      platform: 'instagram',
      raw_payload: profile as unknown as Record<string, unknown>,
      normalized,
    });
    if (scanErr) {
      console.error('[scan/run] scan insert failed', scanErr);
      throw new Error(`scan_insert_failed: ${scanErr.message}`);
    }

    const { error: updErr } = await supabase
      .from('vt_leads')
      .update({
        status: 'scored',
        evidence_score: evidenceScore,
        gap_summary: gap,
      })
      .eq('id', leadId);
    if (updErr) {
      console.error('[scan/run] lead update failed', updErr);
      throw new Error(`lead_update_failed: ${updErr.message}`);
    }

    return NextResponse.json({
      lead_id: leadId,
      ig_handle: lead.ig_handle,
      evidence_score: evidenceScore,
      met_count: gap.met.length,
      gap_count: gap.gaps.length,
      is_private: profile.is_private,
    });
  } catch (err) {
    const code = err instanceof InstagramScraperError ? err.code : 'unknown';
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[scan/run] failed', code, detail);
    await supabase
      .from('vt_leads')
      .update({ status: 'error', error_message: `${code}: ${detail}`.slice(0, 500) })
      .eq('id', leadId);
    return NextResponse.json({ error: 'scan_failed', code, detail }, { status: 500 });
  }
}
