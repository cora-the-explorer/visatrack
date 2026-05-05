'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DarkHeader } from '@/components/marketplace/dark-header';

const STEPS = ['Identity', 'Career & Platform', 'Evidence Sources', 'Proof of Pay'] as const;

type FieldDef = { name: string; label: string; required?: boolean; placeholder?: string; type?: string; textarea?: boolean; select?: string[] };

const STEP_FIELDS: Record<number, FieldDef[]> = {
  1: [
    { name: 'legal_name', label: 'Legal name', required: true, placeholder: 'As shown on your passport' },
    { name: 'stage_name', label: 'Stage / Creator name', required: true, placeholder: 'e.g. Peggy Gou, MrBeast' },
    { name: 'email', label: 'Email', required: true, type: 'email', placeholder: 'you@yourdomain.com' },
    { name: 'phone', label: 'WhatsApp / Phone', placeholder: '+44 7…' },
    { name: 'citizenship', label: 'Country of citizenship', required: true, placeholder: 'South Korea' },
    { name: 'based', label: 'Currently based in', placeholder: 'Berlin' },
  ],
  2: [
    {
      name: 'primary_platform',
      label: 'Primary platform',
      required: true,
      select: [
        'Music / Recording Artist',
        'DJ / Electronic',
        'YouTube',
        'TikTok',
        'Instagram',
        'Twitch',
        'Multi-platform',
      ],
    },
    { name: 'genre', label: 'Primary genre / niche', required: true, placeholder: 'House, hip-hop, beauty, gaming…' },
    { name: 'years_active', label: 'Years working professionally', type: 'number', placeholder: '8' },
    { name: 'total_followers', label: 'Total followers across platforms', type: 'number', placeholder: '4200000' },
    { name: 'monthly_reach', label: 'Monthly reach / impressions', type: 'number', placeholder: '12000000' },
    { name: 'biggest_brand_deal', label: 'Biggest brand deal value (USD)', placeholder: '$45,000' },
    { name: 'brand_partners', label: 'Top 3 brand / sponsor partners', textarea: true, placeholder: 'Nike, Fashion Nova, SeatGeek' },
    { name: 'big_gigs', label: 'Three biggest moments in last 3 years', textarea: true, placeholder: 'Coachella 2025 — Mojave Stage' },
  ],
  3: [
    { name: 'youtube', label: 'YouTube channel URL', placeholder: 'https://youtube.com/@…' },
    { name: 'tiktok', label: 'TikTok profile URL', placeholder: 'https://tiktok.com/@…' },
    { name: 'instagram', label: 'Instagram handle', placeholder: '@yourhandle' },
    { name: 'spotify', label: 'Spotify artist URL', placeholder: 'https://open.spotify.com/artist/…' },
    { name: 'beatport', label: 'Beatport profile URL', placeholder: 'https://www.beatport.com/artist/…' },
    { name: 'ra', label: 'Resident Advisor profile URL', placeholder: 'https://ra.co/dj/…' },
    { name: 'top_content_url', label: 'Highest-viewed piece of content (URL)', placeholder: 'https://youtube.com/watch?v=…' },
    { name: 'top_content_views', label: '…and its view count', placeholder: '84,000,000' },
    { name: 'press', label: 'Recent press URLs (one per line)', textarea: true, placeholder: 'https://mixmag.net/feature/…' },
  ],
  4: [
    { name: 'avg_fee', label: 'Average gig fee or post rate (USD)', placeholder: '$8,500 per gig' },
    { name: 'top_fee', label: 'Highest single payday last 12 months', placeholder: '$85,000 brand campaign' },
    { name: 'annual_revenue', label: 'Annual revenue estimate (USD)', placeholder: '$640,000' },
    { name: 'brand_deals_count', label: 'Paid brand deals last 12 months', type: 'number', placeholder: '14' },
    { name: 'references', label: 'Industry references willing to write a letter (3–8)', textarea: true, placeholder: 'Name — Title — Org — Email' },
    { name: 'notes', label: 'Anything else worth knowing?', textarea: true, placeholder: 'Awards, residencies, label ownership…' },
  ],
};

export default function IntakePage() {
  const router = useRouter();
  const [cur, setCur] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const field = (f: FieldDef) => {
    const common = {
      name: f.name,
      required: f.required,
      placeholder: f.placeholder,
      value: data[f.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setData((d) => ({ ...d, [f.name]: e.target.value })),
    };
    return (
      <div className="vt-field" key={f.name}>
        <label>
          {f.label}
          {f.required ? <span className="req">*</span> : null}
        </label>
        {f.textarea ? (
          <textarea {...common} />
        ) : f.select ? (
          <select {...common}>
            <option value="">Select one…</option>
            {f.select.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input type={f.type || 'text'} {...common} />
        )}
      </div>
    );
  };

  const currentFields = STEP_FIELDS[cur] ?? [];

  const validate = () => {
    for (const f of currentFields) {
      if (f.required && !(data[f.name] || '').trim()) {
        setError(`Please fill in ${f.label}`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const onNext = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (cur === 1) {
      try {
        await fetch('/api/intake/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            legal_name: data.legal_name,
            stage_name: data.stage_name,
            phone: data.phone,
            citizenship: data.citizenship,
            based: data.based,
          }),
        });
      } catch {
        // we don't block intake on this
      }
    }
    if (cur < STEPS.length) {
      setCur(cur + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake: data }),
      });
      if (!res.ok) throw new Error('Failed to start dossier');
      const json = (await res.json()) as { caseId: string };
      router.push(`/processing/${json.caseId}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <DarkHeader
        steps={[
          { label: '01 · Intake', active: true },
          { label: '02 · Dossier' },
          { label: '03 · Counsel' },
        ]}
      />
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '64px 28px 120px' }}>
        <div className="vt-filebar">
          <span className="vt-pill">File No. 02–A</span>
          <span>
            Intake — Step {cur} of {STEPS.length}
          </span>
        </div>

        <h1
          className="serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(40px, 6vw, 64px)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
            margin: '0 0 18px',
          }}
        >
          You did the work.
          <br />
          We do the{' '}
          <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)', fontWeight: 400 }}>
            paperwork.
          </em>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: '62ch', margin: '0 0 40px' }}>
          Four short pages. No credit card. The AI starts working the second you hit submit, then
          vetted O-1B firms compete to file your case.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
          {STEPS.map((_, i) => {
            const n = i + 1;
            const status = n < cur ? 'done' : n === cur ? 'active' : '';
            return (
              <div
                key={n}
                style={{
                  flex: 1,
                  height: 3,
                  background:
                    status === 'done'
                      ? 'var(--accent)'
                      : status === 'active'
                        ? 'linear-gradient(90deg,var(--accent) 50%,var(--rule) 50%)'
                        : 'var(--rule)',
                  boxShadow: status ? '0 0 8px rgba(57,255,138,.4)' : 'none',
                }}
              />
            );
          })}
        </div>

        <form
          onSubmit={onNext}
          className="vt-card accent"
          style={{ background: '#1a1a1a' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 24,
              fontSize: 11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
            }}
          >
            <span style={{ color: 'var(--accent)' }}>
              § 0{cur} — {STEPS[cur - 1]}
            </span>
            <span>Step {cur} of {STEPS.length}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {currentFields.map((f) =>
              f.textarea ? (
                <div key={f.name} style={{ gridColumn: '1 / -1' }}>
                  {field(f)}
                </div>
              ) : (
                field(f)
              ),
            )}
          </div>
          {error ? (
            <div style={{ marginTop: 18, color: '#ff5c8a', fontSize: 13 }}>{error}</div>
          ) : null}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 36,
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="vt-btn"
              disabled={cur === 1}
              onClick={() => setCur((c) => Math.max(1, c - 1))}
            >
              ← Back
            </button>
            <button type="submit" className="vt-cta" disabled={submitting}>
              {submitting
                ? 'Building…'
                : cur === STEPS.length
                  ? 'Build my dossier →'
                  : 'Next →'}
            </button>
          </div>
        </form>

        <div
          style={{
            display: 'flex',
            gap: 18,
            flexWrap: 'wrap',
            marginTop: 48,
            fontSize: 11,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          <span>
            <span style={{ color: 'var(--accent)', marginRight: 6 }}>✓</span>Encrypted in transit
          </span>
          <span>
            <span style={{ color: 'var(--accent)', marginRight: 6 }}>✓</span>Never sold or shared
          </span>
          <span>
            <span style={{ color: 'var(--accent)', marginRight: 6 }}>✓</span>Deleted on request
          </span>
          <span>
            <Link href="/login" className="vt-link">
              Already have an account? →
            </Link>
          </span>
        </div>
      </main>
    </>
  );
}
