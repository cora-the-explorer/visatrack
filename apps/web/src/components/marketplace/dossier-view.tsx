import type { ArtistCase } from '@/lib/store';
import { coverageCount } from '@/lib/mock-evidence';

export function DossierStats({ c }: { c: ArtistCase }) {
  const press = c.evidenceData?.press.length ? `${c.evidenceData.press.length}+` : '—';
  const letters = c.evidenceData?.testimonials.length ?? 0;
  const cov = `${coverageCount(c.criteriaCoverage)}/8`;
  const score = c.evidenceScore ?? '—';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
      {[
        [press, 'Press hits'],
        [String(letters || 8), 'Testimonials'],
        [cov, 'USCIS Criteria'],
        [String(score), 'Evidence Score'],
      ].map(([n, l]) => (
        <div className="vt-stat" key={String(l)}>
          <div className="num">{n}</div>
          <div className="lbl">{l}</div>
        </div>
      ))}
    </div>
  );
}

export function DossierGrid({ c, locked }: { c: ArtistCase; locked: boolean }) {
  const ev = c.evidenceData;
  if (!ev) {
    return (
      <div className="vt-card" style={{ padding: 24 }}>
        <div className="vt-section-eyebrow">Dossier compiling…</div>
        <p style={{ color: 'var(--ink-2)', margin: 0 }}>
          Your dossier is still being assembled. Refresh in a moment.
        </p>
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
      <Section
        title="Press Clippings"
        eyebrow="§ 01 — Press Archive"
        locked={locked}
        lockText="Unlock all articles"
      >
        {ev.press.map((p, i) => (
          <Row key={i} left={<><strong>{p.outlet}</strong> — {p.title}</>} right={<span style={{ color: 'var(--muted)', fontSize: 12 }}>{p.year}</span>} />
        ))}
      </Section>

      <Section title="Chart Rankings" eyebrow="§ 02 — Charts & Standing">
        {ev.charts.map((ch, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <Row left={<span>{ch.name}</span>} right={<strong style={{ color: 'var(--accent)' }}>{ch.rank}</strong>} />
            <div style={{ height: 3, background: 'var(--rule)', marginTop: 6 }}>
              <div style={{ width: `${ch.bar}%`, height: '100%', background: 'var(--accent)', boxShadow: '0 0 8px rgba(57,255,138,.4)' }} />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Social Proof & Followers" eyebrow="§ 03 — Platform Reach">
        {ev.social.map((s, i) => (
          <Row key={i} left={<span>{s.platform}</span>} right={<strong style={{ color: 'var(--accent)' }}>{s.value}</strong>} />
        ))}
      </Section>

      <Section title="Signed Performance Contracts" eyebrow="§ 04 — High Salary" locked={locked} lockText="High salary verified">
        {ev.contracts.map((ct, i) => (
          <Row key={i} left={<span>{ct.event}</span>} right={<strong>{ct.amount}</strong>} />
        ))}
      </Section>

      <Section title="Letter Excerpt — Festival Booker" eyebrow="§ 05 — Expert Testimonials" locked={locked} lockText={`Unlock ${ev.testimonials.length - 1} more letters`}>
        <div style={{ fontStyle: 'italic', color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.7 }}>
          “{ev.testimonials[0]?.preview}”
          <div style={{ marginTop: 10, fontStyle: 'normal', color: 'var(--muted)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            — {ev.testimonials[0]?.author}, {ev.testimonials[0]?.role}
          </div>
        </div>
      </Section>

      <Section title="O-1B Argument Summary" eyebrow="§ 06 — Brief" locked={locked} lockText="Full 3,427-word brief">
        {ev.briefSummary.slice(0, 4).map((b, i) => (
          <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--rule)', fontSize: 13 }}>
            {b}
          </div>
        ))}
      </Section>

      <div style={{ gridColumn: '1 / -1' }}>
        <Section title="Creator Reach & Brand Authority" eyebrow="§ 07 — Digital Footprint">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <div>
              <div className="vt-section-eyebrow" style={{ marginBottom: 8 }}>Top posts</div>
              {ev.topPosts.map((p, i) => (
                <Row key={i} left={<span style={{ fontSize: 13 }}>{p.title}</span>} right={<strong style={{ color: 'var(--accent)' }}>{p.views}</strong>} />
              ))}
            </div>
            <div>
              <div className="vt-section-eyebrow" style={{ marginBottom: 8 }}>Brand deals</div>
              <Row left={<span>{ev.brandDeals.count} paid deals (12mo)</span>} right={<strong style={{ color: 'var(--accent)' }}>{ev.brandDeals.total}</strong>} />
              <Row left={<span>Top: {ev.brandDeals.topPartner}</span>} right={<strong>{ev.brandDeals.topAmount}</strong>} />
            </div>
            <div>
              <div className="vt-section-eyebrow" style={{ marginBottom: 8 }}>Monetization</div>
              {ev.monetization.map((m, i) => (
                <Row key={i} left={<span>{m.item}</span>} right={<strong style={{ color: 'var(--accent)' }}>{m.status}</strong>} />
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  eyebrow,
  locked,
  lockText,
  children,
}: {
  title: string;
  eyebrow: string;
  locked?: boolean;
  lockText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="vt-card" style={{ overflow: 'hidden' }}>
      <div className="vt-section-eyebrow">{eyebrow}</div>
      <h3>{title}</h3>
      <div style={{ position: 'relative' }}>
        {children}
        {locked ? (
          <div className="vt-lock">
            <span>🔒 {lockText || 'Unlock'}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14 }}>
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}
