import Link from 'next/link';
import { DarkHeader } from '@/components/marketplace/dark-header';

export const metadata = {
  title: 'VisaTrack — O-1B dossiers for DJs, artists & creators',
  description:
    'AI builds the dossier in 90 seconds. A real immigration firm files it. Get matched with vetted O-1B counsel.',
};

export default function LandingPage() {
  return (
    <>
      <DarkHeader
        steps={[
          { label: '01 · Intake', active: true },
          { label: '02 · Dossier' },
          { label: '03 · Counsel' },
        ]}
      />

      <section style={{ padding: '64px 28px 32px', borderBottom: '1px solid var(--rule)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
            gap: 56,
            alignItems: 'end',
            maxWidth: 1320,
            margin: '0 auto',
          }}
          className="vt-hero-grid"
        >
          <div>
            <div className="vt-filebar">
              <span className="vt-pill">File No. 01–B</span>
              <span>DJs · Artists · Creators · Influencers</span>
            </div>
            <h1
              className="serif"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(56px, 9vw, 124px)',
                lineHeight: 0.92,
                letterSpacing: '-0.035em',
                margin: '0 0 28px',
              }}
            >
              You built the{' '}
              <em
                style={{
                  fontStyle: 'italic',
                  color: 'var(--accent)',
                  textShadow: 'var(--glow)',
                  fontWeight: 400,
                }}
              >
                career.
              </em>
              <br />
              We match the{' '}
              <em
                style={{
                  fontStyle: 'italic',
                  color: 'var(--accent)',
                  textShadow: 'var(--glow)',
                  fontWeight: 400,
                }}
              >
                lawyer.
              </em>
            </h1>
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.55,
                color: 'var(--ink-2)',
                maxWidth: 560,
                margin: '0 0 34px',
              }}
            >
              We scrape Instagram, TikTok, YouTube, Spotify, RA, Beatport and the press to build
              the evidence dossier an O-1B paralegal bills $11,400 to assemble — then put it in
              front of vetted immigration firms competing for your case.
            </p>
            <Link href="/intake" className="vt-cta">
              Build my dossier — Free
              <span style={{ fontSize: 18 }}>→</span>
            </Link>
            <div
              style={{
                marginTop: 12,
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
              }}
            >
              No credit card · ~90 seconds · You pick the firm
            </div>
          </div>

          <aside
            style={{
              border: '1px solid var(--accent)',
              background: 'var(--paper-2)',
              padding: 22,
              position: 'relative',
              boxShadow: '8px 8px 0 var(--accent), 0 0 24px rgba(57,255,138,.22)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -12,
                right: 18,
                background: 'var(--paper)',
                padding: '0 8px',
                fontSize: 10,
                letterSpacing: '0.22em',
                color: 'var(--accent)',
                fontWeight: 600,
                textShadow: 'var(--glow-soft)',
              }}
            >
              ✱ AI–ASSEMBLED
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                borderBottom: '1px dashed var(--rule-strong)',
                paddingBottom: 10,
                marginBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>USCIS Form I-129 · O Supplement</span>
            </div>
            <div className="serif" style={{ fontStyle: 'italic', fontSize: 26, margin: '8px 0 24px' }}>
              "Extraordinary ability in the arts."
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Beneficiary', 'YOU ___________'],
                ['Petitioner', 'U.S. Agent'],
                ['Counsel', '5 firms bidding →'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr',
                    gap: 16,
                    padding: '10px 0',
                    borderBottom: '1px solid var(--rule)',
                    fontSize: 13,
                  }}
                >
                  <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    {k}
                  </span>
                  <span className="serif" style={{ fontSize: 16, color: 'var(--ink)' }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div
        style={{
          overflow: 'hidden',
          borderTop: '1px solid var(--accent)',
          borderBottom: '1px solid var(--accent)',
          background: '#141414',
          color: 'var(--accent)',
          padding: '16px 28px',
          fontSize: 12,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 500,
          textAlign: 'center',
          textShadow: '0 0 10px rgba(57,255,138,.45)',
        }}
      >
        O-1B Marketplace · Vetted firms compete · You choose · No upfront fee
      </div>

      <section style={{ padding: '96px 28px', borderBottom: '1px solid var(--rule)', maxWidth: 1320, margin: '0 auto' }}>
        <div className="vt-section-eyebrow">§ 02 — How it works</div>
        <h2
          className="serif"
          style={{
            fontWeight: 400,
            fontSize: 'clamp(36px, 5vw, 60px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 64px',
            maxWidth: '20ch',
          }}
        >
          The dossier takes 90 seconds. Picking the firm takes maybe an afternoon.
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '1px solid var(--rule-strong)',
          }}
          className="vt-steps-grid"
        >
          {[
            {
              n: '01',
              title: 'Tell us about your career',
              body: 'DJ, artist, creator, influencer — drop your handles, your biggest moments, your numbers. Two minutes of input.',
            },
            {
              n: '02',
              title: 'AI builds your dossier',
              body: 'Instagram, TikTok, YouTube, Spotify, RA, Beatport, press archives — scraped, verified, mapped to USCIS criteria.',
            },
            {
              n: '03',
              title: 'Firms compete for your case',
              body: 'Vetted O-1B firms see your dossier and bid: price, timeline, pitch. You pick. They file.',
            },
          ].map((s) => (
            <div key={s.n} style={{ padding: '36px 28px', borderRight: '1px solid var(--rule)' }}>
              <div
                className="serif"
                style={{ fontStyle: 'italic', fontSize: 56, lineHeight: 1, marginBottom: 28, color: 'var(--accent)', textShadow: 'var(--glow)' }}
              >
                {s.n}
              </div>
              <h3
                className="serif"
                style={{ fontWeight: 500, fontSize: 24, letterSpacing: '-0.01em', margin: '0 0 12px' }}
              >
                {s.title}
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0, maxWidth: '36ch' }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        {[
          ['94%', 'O-1B approval rate among partner counsel'],
          ['15 days', 'USCIS premium processing window'],
          ['$11,400', 'What an attorney charges to do this from scratch'],
          ['90 sec', 'How fast we hand you the dossier'],
        ].map(([num, lbl]) => (
          <div key={lbl} style={{ padding: '40px 28px', borderRight: '1px solid var(--rule)' }}>
            <div
              className="serif"
              style={{
                fontWeight: 500,
                fontSize: 48,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                marginBottom: 14,
                color: 'var(--accent)',
                textShadow: 'var(--glow-soft)',
              }}
            >
              {num}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted)', maxWidth: '26ch' }}>
              {lbl}
            </div>
          </div>
        ))}
      </section>

      <section style={{ padding: '120px 28px', textAlign: 'center', borderBottom: '1px solid var(--rule)' }}>
        <h3
          className="serif"
          style={{
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(40px, 6vw, 80px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: '0 0 40px',
          }}
        >
          You did the work.
          <br />
          <span style={{ fontStyle: 'normal', color: 'var(--accent)', textShadow: 'var(--glow)' }}>
            VisaTrack matches the lawyer.
          </span>
        </h3>
        <Link href="/intake" className="vt-cta">
          Start free dossier
          <span style={{ fontSize: 18 }}>→</span>
        </Link>
        <div style={{ marginTop: 18, fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          For firms · <Link href="/firms" className="vt-link">Get qualified leads in your inbox →</Link>
        </div>
      </section>

      <footer
        style={{
          padding: 28,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 14,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
        }}
      >
        <span>VisaTrack.AI © 2026</span>
        <span>Not a Law Firm · Counsel Provided By Vetted Partners</span>
        <Link href="/firms" className="vt-link">
          For attorneys →
        </Link>
      </footer>
    </>
  );
}
