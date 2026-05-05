'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

export function AuditPricingCard({
  caseId,
  standardCents,
  conciergeCents,
}: {
  caseId: string;
  standardCents: number;
  conciergeCents: number;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<'standard' | 'concierge' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buy = async (tier: 'standard' | 'concierge') => {
    setSubmitting(tier);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Audit purchase failed');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(null);
    }
  };

  return (
    <div className="vt-card accent" style={{ marginTop: 32, background: '#1a1a1a' }}>
      <div className="vt-section-eyebrow accent">× Unlock your audit ×</div>
      <h2 className="serif" style={{ fontWeight: 500, fontSize: 28, margin: '0 0 12px' }}>
        Pick a tier and unlock the full dossier.
      </h2>
      <p style={{ color: 'var(--ink-2)', margin: '0 0 24px', maxWidth: '60ch', fontSize: 14 }}>
        Audit gives you the numerical score, criterion breakdown, sources for every exhibit,
        and 3 specific actions to lift your score. Listing in the marketplace is free —
        once audited, vetted firms can claim your case for a flat unlock fee.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <div className="vt-card" style={{ borderColor: 'var(--rule)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
            Standard
          </div>
          <div className="serif" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1, margin: '0 0 12px' }}>
            {fmt$(standardCents)}
          </div>
          <ul style={{ color: 'var(--ink-2)', fontSize: 13, margin: '0 0 18px', paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Numerical evidence score (0–100)</li>
            <li>Per-criterion breakdown</li>
            <li>3 specific actions to lift the score</li>
            <li>Source links + full evidence extracts</li>
            <li>Listing eligibility unlocked</li>
          </ul>
          <button
            type="button"
            className="vt-btn"
            onClick={() => buy('standard')}
            disabled={submitting !== null}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {submitting === 'standard' ? 'Unlocking…' : `Standard Audit — ${fmt$(standardCents)}`}
          </button>
        </div>
        <div className="vt-card accent" style={{ borderColor: 'var(--accent)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
            Audit + Concierge
          </div>
          <div className="serif" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1, margin: '0 0 12px', color: 'var(--accent)', textShadow: 'var(--glow)' }}>
            {fmt$(conciergeCents)}
          </div>
          <ul style={{ color: 'var(--ink-2)', fontSize: 13, margin: '0 0 18px', paddingLeft: 18, lineHeight: 1.6 }}>
            <li>Everything in Standard</li>
            <li>20-minute concierge call</li>
            <li>Custom recommendation letter template</li>
            <li>Priority badge in firm marketplace (7 days)</li>
            <li>Skip-the-line on first 3 firm claims</li>
          </ul>
          <button
            type="button"
            className="vt-cta"
            onClick={() => buy('concierge')}
            disabled={submitting !== null}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {submitting === 'concierge' ? 'Unlocking…' : `Audit + Concierge — ${fmt$(conciergeCents)}`}
          </button>
        </div>
      </div>
      {error ? (
        <div style={{ color: '#ff5c8a', marginTop: 16, fontSize: 13 }}>{error}</div>
      ) : null}
      <div style={{ marginTop: 18, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>
        Demo mode · No real Stripe charge · Track A
      </div>
    </div>
  );
}

export function PreviewCountdown({ expiresAt }: { expiresAt: number }) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, expiresAt - now);
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  if (remaining <= 0) {
    return (
      <span style={{ color: '#ff5c8a' }}>Preview window closed — refresh to re-lock</span>
    );
  }
  return (
    <span>
      Preview expires in <b>{hours}h {minutes.toString().padStart(2, '0')}m</b>
    </span>
  );
}

export function AddonButton({
  caseId,
  kind,
  label,
  priceCents,
  variant = 'btn',
}: {
  caseId: string;
  kind: 'manager_kit' | 'express_evidence' | 'relist_boost' | 're_audit';
  label: string;
  priceCents: number;
  variant?: 'btn' | 'cta';
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buy = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/addon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Addon purchase failed');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={variant === 'cta' ? 'vt-cta' : 'vt-btn'}
        onClick={buy}
        disabled={busy}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {busy ? 'Processing…' : `${label} — ${fmt$(priceCents)}`}
      </button>
      {error ? (
        <div style={{ color: '#ff5c8a', marginTop: 8, fontSize: 12 }}>{error}</div>
      ) : null}
    </>
  );
}
