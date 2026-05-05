import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';
import { coverageCount } from '@/lib/mock-evidence';

export default async function PortalOverview() {
  const session = await getSession();
  if (!session || session.kind !== 'artist') redirect('/login?role=artist');
  const cases = await store.listCasesByArtist(session.artistId);
  const c = cases[cases.length - 1]; // newest

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

  const bids = await store.listBidsForCase(c.id);
  const accepted = bids.find((b) => b.status === 'accepted');
  const pending = bids.filter((b) => b.status === 'pending').length;
  const handoff = accepted ? await store.getHandoffForCase(c.id) : undefined;
  const firmAccepted = accepted ? await store.getFirm(accepted.firmId) : undefined;

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
          [String(pending), 'Open bids'],
          [`${coverageCount(c.criteriaCoverage)}/8`, 'USCIS criteria'],
          [String(c.evidenceScore ?? '—'), 'Evidence score'],
        ].map(([n, l]) => (
          <div key={String(l)} className="vt-stat">
            <div className="num">{n}</div>
            <div className="lbl">{l}</div>
          </div>
        ))}
      </div>

      {accepted && firmAccepted ? (
        <div className="vt-card accent" style={{ marginBottom: 32 }}>
          <div className="vt-section-eyebrow accent">✓ Matched</div>
          <h2 className="serif" style={{ fontWeight: 500, fontSize: 28, margin: '0 0 12px' }}>
            You matched with{' '}
            <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)' }}>{firmAccepted.displayName}</em>
          </h2>
          <p style={{ color: 'var(--ink-2)', margin: '0 0 18px' }}>
            ${(accepted.priceCents / 100).toLocaleString('en-US')} · {accepted.timelineWeeks} weeks
            · {firmAccepted.contactName} &lt;
            <a className="vt-link" href={`mailto:${firmAccepted.contactEmail}`}>
              {firmAccepted.contactEmail}
            </a>
            &gt;
          </p>
          {handoff?.notes ? (
            <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: 0 }}>
              <b>Next steps:</b> {handoff.notes}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="vt-card" style={{ marginBottom: 32 }}>
          <div className="vt-section-eyebrow">{c.status === 'listed' ? 'Awaiting bids' : 'Status'}</div>
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            {c.status === 'listed'
              ? `Your dossier is in front of approved firms. ${pending} bid${pending === 1 ? '' : 's'} so far.`
              : c.status === 'dossier_ready'
                ? 'Your dossier is ready. List it to start receiving bids.'
                : 'Your dossier is being prepared.'}
          </p>
          {c.status === 'dossier_ready' ? (
            <Link href={`/match/${c.id}` as never} className="vt-cta" style={{ marginTop: 18 }}>
              Get matched with a firm →
            </Link>
          ) : null}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
        <Link href={'/portal/bids' as never} className="vt-card" style={{ textDecoration: 'none', display: 'block' }}>
          <div className="vt-section-eyebrow">Bids</div>
          <h3>{pending} open · {bids.length} total</h3>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: '0 0 14px' }}>
            Compare price, timeline, and pitch from each firm.
          </p>
          <span className="vt-link">Review bids →</span>
        </Link>
        <Link href={'/portal/dossier' as never} className="vt-card" style={{ textDecoration: 'none', display: 'block' }}>
          <div className="vt-section-eyebrow">Dossier</div>
          <h3>{c.evidenceData ? `${c.evidenceData.press.length}+ press, ${c.evidenceData.testimonials.length} letters` : 'Compiling…'}</h3>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: '0 0 14px' }}>
            {accepted ? 'Fully unlocked.' : 'Locked preview until you accept a bid.'}
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
    case 'closed':
      return 'Closed';
    default:
      return s;
  }
}
