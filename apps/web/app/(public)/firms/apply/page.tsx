'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { DarkHeader } from '@/components/marketplace/dark-header';

export default function FirmApplyPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    firmName: '',
    contactName: '',
    contactEmail: '',
    website: '',
    ailaMember: false,
    casesLast12Mo: '',
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/firms/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          casesLast12Mo: Number(data.casesLast12Mo) || 0,
        }),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(json.error || 'Could not submit application');
      }
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DarkHeader
        rightSlot={
          <nav className="vt-steps">
            <Link href={'/firms' as never}>← Firms</Link>
          </nav>
        }
      />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 28px 120px' }}>
        <div className="vt-filebar">
          <span className="vt-pill">Firm Application</span>
        </div>
        <h1
          className="serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 16px',
          }}
        >
          Apply for{' '}
          <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)', fontWeight: 400 }}>
            early access
          </em>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ink-2)', margin: '0 0 36px', maxWidth: '60ch' }}>
          We're admitting firms one cohort at a time so artists see real bids, not noise. We
          review every application — usually within 24 hours.
        </p>

        {submitted ? (
          <div className="vt-card accent" style={{ background: '#1a1a1a' }}>
            <div className="vt-section-eyebrow accent">✓ Application received</div>
            <h2 className="serif" style={{ fontWeight: 500, fontSize: 28, margin: '0 0 12px' }}>
              We'll email you within 24h.
            </h2>
            <p style={{ color: 'var(--ink-2)', margin: '0 0 24px' }}>
              Our team reviews every applicant for AILA membership, O-1B volume, and conflicts. If
              you're approved, the next email will be a magic link to your firm console.
            </p>
            <Link href={'/firms' as never} className="vt-btn">
              ← Back to firm overview
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="vt-card accent" style={{ background: '#1a1a1a' }}>
            <div className="vt-field">
              <label>Firm name <span className="req">*</span></label>
              <input required value={data.firmName} onChange={(e) => setData((d) => ({ ...d, firmName: e.target.value }))} placeholder="Aperture Immigration LLP" />
            </div>
            <div className="vt-field">
              <label>Primary attorney name <span className="req">*</span></label>
              <input required value={data.contactName} onChange={(e) => setData((d) => ({ ...d, contactName: e.target.value }))} placeholder="Jane Doe, Esq." />
            </div>
            <div className="vt-field">
              <label>Email <span className="req">*</span></label>
              <input type="email" required value={data.contactEmail} onChange={(e) => setData((d) => ({ ...d, contactEmail: e.target.value }))} placeholder="jane@firm.com" />
            </div>
            <div className="vt-field">
              <label>Website</label>
              <input value={data.website} onChange={(e) => setData((d) => ({ ...d, website: e.target.value }))} placeholder="https://firm.com" />
            </div>
            <div className="vt-field">
              <label># O-1B cases handled in last 12 months</label>
              <input
                type="number"
                min={0}
                value={data.casesLast12Mo}
                onChange={(e) => setData((d) => ({ ...d, casesLast12Mo: e.target.value }))}
                placeholder="42"
              />
            </div>
            <div className="vt-field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                id="aila"
                type="checkbox"
                checked={data.ailaMember}
                onChange={(e) => setData((d) => ({ ...d, ailaMember: e.target.checked }))}
                style={{ width: 'auto', accentColor: '#39ff8a' }}
              />
              <label htmlFor="aila" style={{ margin: 0 }}>
                AILA member
              </label>
            </div>
            {error ? <div style={{ color: '#ff5c8a', marginBottom: 16, fontSize: 13 }}>{error}</div> : null}
            <button type="submit" className="vt-cta" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
              {submitting ? 'Sending…' : 'Submit application →'}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
