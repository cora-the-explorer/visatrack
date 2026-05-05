import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store, ENGAGEMENT_WINDOW_MS } from '@/lib/store';
import { coverageCount } from '@/lib/mock-evidence';

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

function daysRemaining(claimedAt: string): number {
  const elapsed = Date.now() - Date.parse(claimedAt);
  return Math.max(0, Math.ceil((ENGAGEMENT_WINDOW_MS - elapsed) / 86_400_000));
}

export default async function PortalOverview() {
  const session = await getSession();
  if (!session || session.kind !== 'artist') redirect('/login?role=artist');
  const cases = await store.listCasesByArtist(session.artistId);
  const c = cases[cases.length - 1];

  if (!c) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 28px' }}>
        <div className="vt-filebar">
          <span className="vt-pill">My Portal</span>
        </div>
        <h1 className="serif" style={{ fontWeight: 500, fontSize: 44, margin: '0 0 14px' }}>
          No case yet.
        </h1>
        <p style={{ color: 'var(--ink-2)', maxWidth: '60ch' }}>
          Run the intake to build your dossier — it takes about 90 seconds.
        </p>
        <Link href={'/intake' as never} className="vt-cta" style={{ marginTop: 24 }}>
          Start intake →
        </Link>
      </div>
    );
  }

  const claims = await store.listClaimsForCase(c.id);
  const active = claims.find((cl) => cl.status === 'active' || cl.status === 'engaged');
  const firm = active ? await store.getFirm(active.firmId) : undefined;

  const firmStatusLabel = active
    ? active.status === 'engaged'
      ? 'Engaged'
      : 'Matched'
    : c.status === 'released_back'
      ? 'Released'
      : c.status === 'listed'
        ? 'Awaiting'
        : '—';

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">My Portal</span>
        <span>Case #{c.id.slice(0, 8).toUpperCase()}</span>
      </div>
      <h1
        className="serif"
        style={{
          fontWeight: 500,
          fontSize: 'clamp(32px, 4.5vw, 52px)',
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          margin: '0 0 32px',
        }}
      >
        {c.intakeData?.stage_name ? <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)', fontStyle: 'italic', fontWeight: 400 }}>{c.intakeData.stage_name}</em> : 'Your case'}
        ’s O-1B
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
        {[
          [statusLabel(c.status), 'Status'],
          [firmStatusLabel, 'Firm'],
          [`${coverageCount(c.criteriaCoverage)}/8`, 'USCIS criteria'],
          [String(c.evidenceScore ?? '—'), 'Evidence score'],
        ].map(([n, l]) => (
          <div key={String(l)} className="vt-stat">
            <div className="num">{n}</div>
            <div className="lbl">{l}</div>
          </div>
        ))}
      </div>

      {active && firm ? (
        <div className="vt-card accent" style={{ marginBottom: 32 }}>
          <div className="vt-section-eyebrow accent">
            ✓ {active.status === 'engaged' ? 'Engaged' : 'Matched'}
          </div>
          <h2 className="serif" style={{ fontWeight: 500, fontSize: 28, margin: '0 0 12px' }}>
            Your case is with{' '}
            <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)' }}>{firm.displayName}</em>
          </h2>
          <p style={{ color: 'var(--ink-2)', margin: '0 0 18px' }}>
            {firm.contactName} &lt;
            <a className="vt-link" href={`mailto:${firm.contactEmail}`}>
              {firm.contactEmail}
            </a>
            &gt; · unlock paid {fmt$(active.unlockFeeCents)}
          </p>
          {active.status === 'active' ? (
            <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: 0 }}>
              <b>{daysRemaining(active.claimedAt)} day{daysRemaining(active.claimedAt) === 1 ? '' : 's'}</b>{' '}
              remaining in their exclusive engagement window.
            </p>
          ) : null}
        </div>
      ) : c.status === 'released_back' ? (
        <div className="vt-card" style={{ marginBottom: 32 }}>
          <div className="vt-section-eyebrow">Released back</div>
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            The previous firm did not engage within their 7-day window. Your case is back in the
            marketplace and another firm should claim it soon.
          </p>
        </div>
      ) : (
        <div className="vt-card" style={{ marginBottom: 32 }}>
          <div className="vt-section-eyebrow">{c.status === 'listed' ? 'Awaiting claim' : 'Status'}</div>
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            {c.status === 'listed'
              ? 'Your dossier is in front of approved firms. The first eligible firm to claim wins exclusive 7-day engagement.'
              : c.status === 'dossier_ready'
                ? 'Your dossier is ready. List it to enter the marketplace.'
                : 'Your dossier is being prepared.'}
          </p>
          {c.status === 'dossier_ready' ? (
            <Link href={`/match/${c.id}` as never} className="vt-cta" style={{ marginTop: 18 }}>
              List my case →
            </Link>
          ) : null}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
        <Link href={'/portal/firm' as never} className="vt-card" style={{ textDecoration: 'none', display: 'block' }}>
          <div className="vt-section-eyebrow">Firm</div>
          <h3>
            {active && firm ? firm.displayName : c.status === 'released_back' ? 'Released' : 'Awaiting'}
          </h3>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: '0 0 14px' }}>
            {active
              ? 'Vetted firm chosen by the platform via claim order.'
              : 'No firm has claimed your case yet.'}
          </p>
          <span className="vt-link">View firm →</span>
        </Link>
        <Link href={'/portal/dossier' as never} className="vt-card" style={{ textDecoration: 'none', display: 'block' }}>
          <div className="vt-section-eyebrow">Dossier</div>
          <h3>{c.evidenceData ? `${c.evidenceData.press.length}+ press, ${c.evidenceData.testimonials.length} letters` : 'Compiling…'}</h3>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: '0 0 14px' }}>
            {active ? 'Fully unlocked.' : 'Locked preview until a firm claims your case.'}
          </p>
          <span className="vt-link">Open dossier →</span>
        </Link>
      </div>
    </div>
  );
}

function statusLabel(s: string) {
  switch (s) {
    case 'intake':
      return 'Intake';
    case 'processing':
      return 'Processing';
    case 'dossier_ready':
      return 'Dossier ready';
    case 'listed':
      return 'Listed';
    case 'matched':
      return 'Matched';
    case 'claimed':
      return 'Claimed';
    case 'released_back':
      return 'Released';
    case 'closed':
      return 'Closed';
    default:
      return s;
  }
}
