'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DarkHeader } from '@/components/marketplace/dark-header';

export default function MagicLinkLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const search = useSearchParams();
  const initialRole = (search?.get('role') as 'artist' | 'firm' | null) || 'artist';
  const [role, setRole] = useState<'artist' | 'firm'>(initialRole);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLink, setDemoLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const json = (await res.json()) as { ok?: boolean; magicLink?: string; error?: string };
      if (!res.ok) throw new Error(json.error || 'Could not send magic link');
      setSent(true);
      if (json.magicLink) setDemoLink(json.magicLink);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DarkHeader />
      <main style={{ maxWidth: 520, margin: '0 auto', padding: '80px 28px 120px' }}>
        <h1
          className="serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(36px, 5vw, 48px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            margin: '0 0 12px',
          }}
        >
          Sign in
        </h1>
        <p style={{ color: 'var(--ink-2)', margin: '0 0 32px' }}>
          We'll email you a magic link. No password.
        </p>

        <form onSubmit={submit} className="vt-card accent" style={{ background: '#1a1a1a' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['artist', 'firm'] as const).map((r) => (
              <button
                key={r}
                type="button"
                className="vt-btn"
                onClick={() => setRole(r)}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  borderColor: role === r ? 'var(--accent)' : 'var(--rule-strong)',
                  color: role === r ? 'var(--accent)' : 'var(--ink-2)',
                }}
              >
                {r === 'artist' ? 'Artist' : 'Firm'}
              </button>
            ))}
          </div>
          <div className="vt-field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'firm' ? 'you@firm.com' : 'you@yourdomain.com'}
            />
          </div>
          {error ? <div style={{ color: '#ff5c8a', marginBottom: 16, fontSize: 13 }}>{error}</div> : null}
          <button type="submit" className="vt-cta" disabled={submitting || sent} style={{ width: '100%', justifyContent: 'center' }}>
            {sent ? 'Magic link sent ✓' : submitting ? 'Sending…' : 'Send magic link →'}
          </button>
        </form>

        {sent ? (
          <div className="vt-card" style={{ marginTop: 24 }}>
            <div className="vt-section-eyebrow">Check your email</div>
            <p style={{ color: 'var(--ink-2)', margin: 0 }}>
              The link expires in 30 minutes.
            </p>
            {demoLink ? (
              <>
                <div style={{ marginTop: 16 }} className="vt-section-eyebrow accent">
                  Demo mode — link is also here:
                </div>
                <a href={demoLink} className="vt-link mono" style={{ wordBreak: 'break-all', fontSize: 12 }}>
                  {demoLink}
                </a>
              </>
            ) : null}
          </div>
        ) : null}

        <div style={{ marginTop: 32, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'center' }}>
          New here?{' '}
          {role === 'firm' ? (
            <Link href={'/firms/apply' as never} className="vt-link">Apply for firm access →</Link>
          ) : (
            <Link href={'/intake' as never} className="vt-link">Build your dossier →</Link>
          )}
        </div>
      </main>
    </>
  );
}
