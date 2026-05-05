import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store, ENGAGEMENT_WINDOW_MS } from '@/lib/store';

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

function daysRemaining(claimedAt: string): number {
  const elapsed = Date.now() - Date.parse(claimedAt);
  return Math.max(0, Math.ceil((ENGAGEMENT_WINDOW_MS - elapsed) / 86_400_000));
}

export default async function PortalFirmPage() {
  const session = await getSession();
  if (!session || session.kind !== 'artist') redirect('/login?role=artist');
  const cases = await store.listCasesByArtist(session.artistId);
  const c = cases[cases.length - 1];

  if (!c) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 28px' }}>
        <h1 className="serif" style={{ fontSize: 36 }}>No case yet</h1>
      </div>
    );
  }

  const claims = await store.listClaimsForCase(c.id);
  const active = claims.find((cl) => cl.status === 'active' || cl.status === 'engaged');
  const previous = claims.filter((cl) => cl.status === 'released' || cl.status === 'closed');
  const firm = active ? await store.getFirm(active.firmId) : undefined;

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">My Portal</span>
        <span>Firm</span>
      </div>
      <h1
        className="serif"
        style={{
          fontWeight: 500,
          fontSize: 'clamp(32px, 4.5vw, 48px)',
          margin: '0 0 16px',
          letterSpacing: '-0.025em',
        }}
      >
        Your firm
      </h1>

      {active && firm ? (
        <>
          <p style={{ color: 'var(--ink-2)', maxWidth: '60ch', margin: '0 0 36px' }}>
            VisaTrack matched you with the first vetted firm to claim your case. They have a
            7-day exclusive window to reach out and engage.
          </p>

          <div className="vt-card accent" style={{ marginBottom: 24 }}>
            <div className="vt-section-eyebrow accent">
              {active.status === 'engaged' ? '✓ Engaged' : '✓ Claimed'}
            </div>
            <h2 className="serif" style={{ fontWeight: 500, fontSize: 28, margin: '0 0 12px' }}>
              <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)' }}>
                {firm.displayName}
              </em>
            </h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              {(firm.specialties || []).slice(0, 4).map((s) => (
                <span key={s} className="vt-tag">
                  {s}
                </span>
              ))}
              {firm.ailaMember ? <span className="vt-tag accent">AILA member</span> : null}
            </div>
            <p style={{ color: 'var(--ink-2)', margin: '0 0 12px' }}>
              {firm.contactName} &lt;
              <a className="vt-link" href={`mailto:${firm.contactEmail}`}>
                {firm.contactEmail}
              </a>
              &gt;
            </p>
            {active.status === 'active' ? (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)' }}>
                <b>{daysRemaining(active.claimedAt)} day{daysRemaining(active.claimedAt) === 1 ? '' : 's'} left</b>{' '}
                in their exclusive window. If they don't reach out, your case returns to the
                marketplace and another firm can claim it.
              </p>
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)' }}>
                {firm.contactName || 'They'} logged first engagement on{' '}
                {active.engagedAt
                  ? new Date(active.engagedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })
                  : '—'}.
              </p>
            )}
          </div>

          {firm.bio ? (
            <div className="vt-card" style={{ marginBottom: 24 }}>
              <div className="vt-section-eyebrow">About the firm</div>
              <p style={{ margin: 0, color: 'var(--ink-2)' }}>{firm.bio}</p>
            </div>
          ) : null}

          {firm.feePhilosophy ? (
            <div className="vt-card" style={{ marginBottom: 24 }}>
              <div className="vt-section-eyebrow">Fee philosophy</div>
              <p style={{ margin: 0 }}>{firm.feePhilosophy}</p>
            </div>
          ) : null}

          <div className="vt-card">
            <div className="vt-section-eyebrow">Unlock fee</div>
            <p style={{ margin: '0 0 6px' }}>
              {firm.displayName} paid <b>{fmt$(active.unlockFeeCents)}</b> to claim your case.
            </p>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
              That's a flat platform fee, not a referral commission. The firm keeps 100% of legal
              fees.
            </p>
          </div>
        </>
      ) : c.status === 'listed' || c.status === 'released_back' ? (
        <>
          <p style={{ color: 'var(--ink-2)', maxWidth: '60ch', margin: '0 0 36px' }}>
            Your case is back in the marketplace.{' '}
            {c.status === 'released_back'
              ? 'The previous firm did not engage within their 7-day window, so we returned your case to the pool. Another firm should claim it shortly.'
              : 'Vetted firms are reviewing it. We will email you the moment one claims it.'}
          </p>
          <div className="vt-card">
            <div className="vt-section-eyebrow">Still in marketplace</div>
            <p style={{ margin: 0, color: 'var(--ink-2)' }}>
              No firm has claimed your case yet.
            </p>
          </div>
          {previous.length > 0 ? (
            <div className="vt-card" style={{ marginTop: 16 }}>
              <div className="vt-section-eyebrow">Past claims</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-2)' }}>
                {await Promise.all(
                  previous.map(async (cl) => {
                    const f = await store.getFirm(cl.firmId);
                    return (
                      <li key={cl.id} style={{ marginBottom: 6 }}>
                        {f?.displayName || 'Firm'} — {cl.status}
                        {cl.releasedAt
                          ? ` on ${new Date(cl.releasedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                          : ''}
                      </li>
                    );
                  }),
                )}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <div className="vt-card">
          <div className="vt-section-eyebrow">Status</div>
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            {c.status === 'dossier_ready'
              ? 'Your dossier is ready. List it to start the claim flow.'
              : c.status === 'processing'
                ? 'Your dossier is being prepared.'
                : `Status: ${c.status}.`}
          </p>
          {c.status === 'dossier_ready' ? (
            <Link href={`/match/${c.id}` as never} className="vt-cta" style={{ marginTop: 18 }}>
              List my case →
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
