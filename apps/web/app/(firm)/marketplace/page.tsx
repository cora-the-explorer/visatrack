import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';
import { coverageCount } from '@/lib/mock-evidence';

export const metadata = { title: 'Marketplace · VisaTrack' };

export default async function MarketplaceInboxPage() {
  const session = await getSession();
  if (!session || session.kind !== 'firm') redirect('/login?role=firm');

  const open = await store.listOpenCases();
  // Hide cases this firm has already bid on
  const myBids = await store.listBidsByFirm(session.firmId);
  const bidCaseIds = new Set(myBids.map((b) => b.caseId));
  const visible = open.filter((c) => !bidCaseIds.has(c.id));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">Marketplace</span>
        <span>{visible.length} new dossier{visible.length === 1 ? '' : 's'} available</span>
      </div>
      <h1
        className="serif"
        style={{
          fontWeight: 500,
          fontSize: 'clamp(32px, 4.5vw, 52px)',
          margin: '0 0 14px',
          letterSpacing: '-0.025em',
        }}
      >
        Inbox
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '60ch', margin: '0 0 36px' }}>
        Pre-built O-1B dossiers from artists who are ready to file. Review, bid, win.
      </p>

      {visible.length === 0 ? (
        <div className="vt-card">
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            No new dossiers right now. We'll email you the moment something matches your specialties.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {visible.map((c) => {
            const stage = c.intakeData?.stage_name || 'Anonymous';
            const handle = `Artist #${c.id.slice(0, 4).toUpperCase()}`;
            const genre = c.intakeData?.genre || 'unspecified';
            return (
              <Link
                key={c.id}
                href={`/marketplace/${c.id}` as never}
                className="vt-card"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div className="vt-section-eyebrow">{handle}</div>
                <h3>
                  {stage}
                  <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                    · {genre}
                  </span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '14px 0 16px' }}>
                  <Stat n={String(c.evidenceScore ?? '—')} l="Score" />
                  <Stat n={`${coverageCount(c.criteriaCoverage)}/8`} l="Criteria" />
                  <Stat n={c.budgetBand || '—'} l="Budget" />
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 12 }}>
                  📍 {c.location || 'Location not specified'} · ⏱ Target {c.targetVisaDate ? new Date(c.targetVisaDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                </div>
                {c.briefNote ? (
                  <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 14 }}>
                    "{c.briefNote.slice(0, 110)}{c.briefNote.length > 110 ? '…' : ''}"
                  </div>
                ) : null}
                <span className="vt-link">View dossier →</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="serif" style={{ fontSize: 22, color: 'var(--accent)', textShadow: 'var(--glow-soft)', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
    </div>
  );
}
