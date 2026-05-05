import Link from 'next/link';
import { DarkHeader } from '@/components/marketplace/dark-header';

export const metadata = { title: 'For firms — VisaTrack' };

export default function FirmsLanding() {
  return (
    <>
      <DarkHeader
        steps={[]}
        rightSlot={
          <nav className="vt-steps">
            <Link href={'/' as never} className="vt-link">
              For artists
            </Link>
            <span className="sep">/</span>
            <Link href={'/login' as never}>Sign in</Link>
          </nav>
        }
      />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 28px 96px' }}>
        <div className="vt-filebar">
          <span className="vt-pill">For Firms</span>
          <span>Pre-built dossiers · Pre-qualified artists</span>
        </div>
        <h1
          className="serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(40px, 7vw, 88px)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            margin: '0 0 28px',
            maxWidth: '14ch',
          }}
        >
          Get qualified{' '}
          <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)', fontWeight: 400 }}>
            O-1B leads
          </em>{' '}
          in your inbox.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: '60ch', margin: '0 0 36px' }}>
          Stop wasting paralegal hours on intake. We hand you finished evidence dossiers — press,
          contracts, social proof, USCIS criteria mapping — for artists who are already ready to
          file. Bid on the cases you want.
        </p>
        <Link href={'/firms/apply' as never} className="vt-cta">
          Apply for early access
          <span style={{ fontSize: 18 }}>→</span>
        </Link>
        <div style={{ marginTop: 14, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          AILA-vetted · 24h approval · No platform fee for the first 5 wins
        </div>

        <div
          style={{
            marginTop: 96,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '1px solid var(--rule-strong)',
          }}
          className="vt-grid-3"
        >
          {[
            { n: '01', t: 'You get the dossier', b: 'Press, charts, social, contracts, criteria mapping. The work a paralegal would bill 12 hours for.' },
            { n: '02', t: 'You bid', b: 'Set your price, timeline, and pitch. The artist sees every bid side-by-side.' },
            { n: '03', t: 'You file', b: 'Win the case. The dossier is yours. No platform fee on the first five wins.' },
          ].map((s) => (
            <div key={s.n} style={{ padding: '36px 28px', borderRight: '1px solid var(--rule)' }}>
              <div className="serif" style={{ fontStyle: 'italic', fontSize: 56, lineHeight: 1, marginBottom: 24, color: 'var(--accent)', textShadow: 'var(--glow)' }}>
                {s.n}
              </div>
              <h3 className="serif" style={{ fontWeight: 500, fontSize: 22, margin: '0 0 12px' }}>{s.t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0, maxWidth: '36ch' }}>{s.b}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 96, padding: '64px 0', borderTop: '1px solid var(--accent)', borderBottom: '1px solid var(--accent)', textAlign: 'center' }}>
          <h2 className="serif" style={{ fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.1, margin: '0 0 24px', color: 'var(--ink)' }}>
            "We won three O-1Bs in our first month on VisaTrack."
          </h2>
          <Link href={'/firms/apply' as never} className="vt-cta">
            Apply for early access →
          </Link>
        </div>
      </main>
    </>
  );
}
