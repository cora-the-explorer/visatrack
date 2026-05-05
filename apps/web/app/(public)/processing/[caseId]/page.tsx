'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DarkHeader } from '@/components/marketplace/dark-header';

const STEPS: { msg: string; meta: string; delay: number; press?: number; letters?: number; criteria?: string; score?: string }[] = [
  { msg: 'Initialize <b>VisaTrack</b> agent runtime', meta: '11 agents booted', delay: 250 },
  { msg: 'Scrape <b>Beatport</b> chart history', meta: '34 releases', delay: 380 },
  { msg: 'Pull <b>Resident Advisor</b> profile + global DJ rank', meta: 'rank #84', delay: 350 },
  { msg: 'Index <b>Spotify</b> monthly listeners', meta: '847K listeners', delay: 320 },
  { msg: 'Crawl <b>press archive</b> across 12 publications', meta: '47 hits', delay: 480, press: 47 },
  { msg: 'Verify <b>SoundCloud / Mixcloud</b> mix-play counts', meta: '2.3M plays', delay: 320 },
  { msg: 'Cross-reference <b>festival lineups</b> 2023–2025', meta: '18 confirmed', delay: 360 },
  { msg: 'Score against <b>O-1B criterion 1</b> — Lead/Starring Role', meta: 'STRONG', delay: 320, criteria: '1/8' },
  { msg: 'Score against <b>criterion 2</b> — Recognition', meta: 'STRONG', delay: 280, criteria: '2/8' },
  { msg: 'Score against <b>criterion 3</b> — Critical Reviews', meta: 'STRONG', delay: 280, criteria: '3/8' },
  { msg: 'Score against <b>criterion 4</b> — Commercial Success', meta: 'MODERATE', delay: 260, criteria: '4/8' },
  { msg: 'Score against <b>criterion 5</b> — Recognition by Experts', meta: 'STRONG', delay: 260, criteria: '5/8' },
  { msg: 'Score against <b>criterion 6</b> — High Salary', meta: 'PENDING CONTRACTS', delay: 260, criteria: '6/8' },
  { msg: 'Generate <b>testimonial draft 1</b> — label founder voice', meta: '421 words', delay: 380, letters: 1 },
  { msg: 'Generate <b>testimonial draft 2</b> — festival booker voice', meta: '389 words', delay: 360, letters: 2 },
  { msg: 'Generate <b>testimonial draft 3</b> — fellow artist voice', meta: '412 words', delay: 360, letters: 3 },
  { msg: 'Generate <b>testimonials 4–8</b> in parallel', meta: '5 drafts', delay: 720, letters: 8 },
  { msg: 'Map evidence to <b>criteria 7 &amp; 8</b>', meta: 'OK', delay: 320, criteria: '8/8' },
  { msg: 'Compile <b>case summary</b> v1', meta: 'OK', delay: 480, score: '87/100' },
  { msg: 'Render <b>firm-facing brief</b>', meta: 'OK', delay: 360 },
  { msg: '<b>Dossier compiled.</b>', meta: 'ready', delay: 280 },
];

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams<{ caseId: string }>();
  const caseId = params?.caseId as string;
  const [shown, setShown] = useState<number>(0);
  const [press, setPress] = useState<number>(0);
  const [letters, setLetters] = useState<number>(0);
  const [criteria, setCriteria] = useState<string>('0/8');
  const [score, setScore] = useState<string>('—');
  const [done, setDone] = useState(false);
  const finalizedRef = useRef(false);

  useEffect(() => {
    let cancel = false;
    let i = 0;
    const tick = () => {
      if (cancel) return;
      if (i >= STEPS.length) {
        setDone(true);
        if (!finalizedRef.current) {
          finalizedRef.current = true;
          fetch(`/api/intake/${caseId}/finalize`, { method: 'POST' })
            .catch(() => null)
            .finally(() => {
              setTimeout(() => router.push(`/dossier/${caseId}`), 1800);
            });
        }
        return;
      }
      const s = STEPS[i];
      if (!s) return;
      i += 1;
      setShown(i);
      if (s.press) setPress(s.press);
      if (s.letters) setLetters(s.letters);
      if (s.criteria) setCriteria(s.criteria);
      if (s.score) setScore(s.score);
      setTimeout(tick, s.delay);
    };
    tick();
    return () => {
      cancel = true;
    };
  }, [caseId, router]);

  return (
    <>
      <DarkHeader
        steps={[
          { label: '01 · Intake' },
          { label: '02 · Dossier', active: true },
          { label: '03 · Counsel' },
        ]}
      />
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '60px 28px 120px' }}>
        <div className="vt-filebar">
          <span className="vt-pill">File No. 02–B</span>
          <span>AI Assembly · live</span>
        </div>
        <h1
          className="serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(36px, 5.4vw, 60px)',
            lineHeight: 1.02,
            letterSpacing: '-0.025em',
            margin: '0 0 14px',
          }}
        >
          Assembling{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent)', textShadow: 'var(--glow)' }}>
            your
          </em>{' '}
          dossier.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: '62ch', margin: '0 0 40px' }}>
          Eleven agents are scraping, ranking, and drafting in parallel. This normally takes a
          paralegal three weeks.
        </p>

        <div
          style={{
            background: '#0e0e0e',
            border: '1px solid var(--rule-strong)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13.5,
            lineHeight: 1.7,
            padding: 0,
            boxShadow: '6px 6px 0 var(--accent), 0 0 28px rgba(57,255,138,.18)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: '#1a1a1a',
              borderBottom: '1px solid var(--rule)',
              fontSize: 11,
              color: 'var(--muted)',
              letterSpacing: '.18em',
              textTransform: 'uppercase',
            }}
          >
            <span>visatrack@dossier:~ — agent runtime</span>
            <span style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5c8a' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffb800' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px rgba(57,255,138,.6)' }} />
            </span>
          </div>
          <div style={{ padding: '22px 24px', minHeight: 520 }}>
            {STEPS.slice(0, shown).map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '88px 24px 1fr auto',
                  gap: 14,
                  alignItems: 'baseline',
                  padding: '6px 0',
                }}
              >
                <span style={{ color: 'var(--muted)' }}>+{((idx + 1) * 0.4).toFixed(2)}s</span>
                <span style={{ color: 'var(--accent)', fontWeight: 700 }}>✓</span>
                <span dangerouslySetInnerHTML={{ __html: s.msg }} />
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>{s.meta}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderTop: '1px solid var(--accent)',
            borderBottom: '1px solid var(--accent)',
            marginTop: 34,
            background: '#0e0e0e',
          }}
        >
          {[
            [press || 0, 'Press hits indexed'],
            [letters || 0, 'Testimonial drafts'],
            [criteria, 'USCIS criteria mapped'],
            [score, 'Evidence strength'],
          ].map(([n, lbl], i) => (
            <div key={i} style={{ padding: 22, borderRight: i < 3 ? '1px solid var(--rule)' : '0', textAlign: 'center' }}>
              <div className="serif" style={{ fontWeight: 500, fontSize: 38, color: 'var(--accent)', textShadow: 'var(--glow)', lineHeight: 1, marginBottom: 8 }}>
                {n}
              </div>
              <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                {lbl}
              </div>
            </div>
          ))}
        </div>

        {done ? (
          <div
            style={{
              marginTop: 36,
              padding: 36,
              background: 'var(--accent)',
              color: '#141414',
              textAlign: 'center',
              boxShadow: '0 0 32px rgba(57,255,138,.4)',
            }}
          >
            <h2 className="serif" style={{ fontWeight: 500, fontSize: 36, margin: '0 0 8px' }}>
              Dossier ready.
            </h2>
            <p style={{ margin: '0 0 22px', opacity: 0.85 }}>
              11 agents finished · 3,427 words drafted · 47 evidence artifacts compiled
            </p>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase' }}>
              Redirecting to your dossier…
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
