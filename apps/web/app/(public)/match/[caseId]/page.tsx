'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DarkHeader } from '@/components/marketplace/dark-header';

export default function MatchPage() {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const caseId = params?.caseId as string;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoLink, setDemoLink] = useState<string | null>(null);
  const [data, setData] = useState({
    targetVisaDate: '',
    location: '',
    budgetBand: '',
    briefNote: '',
  });

  // No state-tracking client-side hydration concerns
  useEffect(() => {
    /* noop */
  }, [caseId]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!data.targetVisaDate || !data.budgetBand) {
      setError('Please pick a target visa date and budget band.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as { ok?: boolean; magicLink?: string; error?: string };
      if (!res.ok) throw new Error(json.error || 'Failed to list case');
      if (json.magicLink) setDemoLink(json.magicLink);
      // Redirect to portal — magic link is sent, but for the demo we also push them in.
      setTimeout(() => router.push('/portal'), json.magicLink ? 2400 : 600);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <>
      <DarkHeader
        steps={[
          { label: '01 · Intake' },
          { label: '02 · Dossier' },
          { label: '03 · Counsel', active: true },
        ]}
      />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 28px 120px' }}>
        <div className="vt-filebar">
          <span className="vt-pill">File No. 03–A</span>
          <span>Marketplace listing</span>
        </div>
        <h1
          className="serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(36px, 5vw, 52px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 14px',
          }}
        >
          Last step:{' '}
          <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)', fontWeight: 400 }}>
            list your case
          </em>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-2)', margin: '0 0 36px', maxWidth: '60ch' }}>
          Vetted O-1B firms see this. They have 48 hours to bid. You'll get a magic link to your
          portal where you can review every bid side by side.
        </p>

        <form onSubmit={submit} className="vt-card accent" style={{ background: '#1a1a1a' }}>
          <div className="vt-field">
            <label>Target visa effective date <span className="req">*</span></label>
            <input
              type="date"
              value={data.targetVisaDate}
              onChange={(e) => setData((d) => ({ ...d, targetVisaDate: e.target.value }))}
              required
            />
          </div>
          <div className="vt-field">
            <label>Where are you now → where do you need the visa?</label>
            <input
              placeholder="e.g. Berlin → Brooklyn"
              value={data.location}
              onChange={(e) => setData((d) => ({ ...d, location: e.target.value }))}
            />
          </div>
          <div className="vt-field">
            <label>Budget band <span className="req">*</span></label>
            <select
              value={data.budgetBand}
              onChange={(e) => setData((d) => ({ ...d, budgetBand: e.target.value }))}
              required
            >
              <option value="">Select one…</option>
              <option>Under $5k</option>
              <option>$5–10k</option>
              <option>$10–15k</option>
              <option>$15k+</option>
            </select>
          </div>
          <div className="vt-field">
            <label>Brief note for firms</label>
            <textarea
              placeholder="What matters most? Premium processing? Specific deadline? A particular festival you need to be at?"
              value={data.briefNote}
              onChange={(e) => setData((d) => ({ ...d, briefNote: e.target.value }))}
            />
          </div>
          {error ? <div style={{ color: '#ff5c8a', marginBottom: 16, fontSize: 13 }}>{error}</div> : null}
          <button type="submit" className="vt-cta" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
            {submitting ? 'Sending dossier to firms…' : 'List my case →'}
          </button>
        </form>

        {demoLink ? (
          <div className="vt-card" style={{ marginTop: 24, background: 'rgba(57,255,138,.06)', borderColor: 'var(--accent)' }}>
            <div className="vt-section-eyebrow accent">Demo mode — magic link</div>
            <p style={{ margin: '0 0 12px', color: 'var(--ink-2)', fontSize: 14 }}>
              We logged the magic-link email (no SMTP configured). For the demo, here's the link
              you'd receive:
            </p>
            <a href={demoLink} className="vt-link mono" style={{ wordBreak: 'break-all', fontSize: 12 }}>
              {demoLink}
            </a>
          </div>
        ) : null}

        <div style={{ marginTop: 36, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>
          Your dossier is never shared until you list · You can withdraw anytime
        </div>
      </main>
    </>
  );
}
