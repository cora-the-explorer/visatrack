import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';

export default async function PortalBidsList() {
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
  const bids = await store.listBidsForCase(c.id);
  const enriched = await Promise.all(
    bids.map(async (b) => ({ bid: b, firm: await store.getFirm(b.firmId) })),
  );
  enriched.sort((a, b) => Date.parse(b.bid.submittedAt) - Date.parse(a.bid.submittedAt));

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">My Portal</span>
        <span>Bids inbox</span>
      </div>
      <h1
        className="serif"
        style={{
          fontWeight: 500,
          fontSize: 'clamp(32px, 4.5vw, 48px)',
          margin: '0 0 12px',
        }}
      >
        {bids.length} bid{bids.length === 1 ? '' : 's'} on your case
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '60ch', margin: '0 0 36px' }}>
        Each bid is a fixed-fee offer from a vetted O-1B firm. Compare them, then accept the one
        you want to work with.
      </p>

      {enriched.length === 0 ? (
        <div className="vt-card">
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            No bids yet. Most firms respond inside 48 hours.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {enriched.map(({ bid, firm }) => (
            <Link
              key={bid.id}
              href={`/portal/bids/${bid.id}` as never}
              className="vt-card"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 24,
                alignItems: 'center',
                textDecoration: 'none',
                borderColor:
                  bid.status === 'accepted'
                    ? 'var(--accent)'
                    : bid.status === 'declined'
                      ? 'var(--rule)'
                      : 'var(--rule-strong)',
                opacity: bid.status === 'declined' ? 0.5 : 1,
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 4px' }}>{firm?.displayName || 'Firm'}</h3>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                  {firm?.casesHandled || 0} O-1B cases handled · {firm?.specialties?.slice(0, 2).join(' · ') || ''}
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>{bid.pitch.slice(0, 160)}…</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="serif" style={{ fontSize: 28, color: 'var(--accent)', textShadow: 'var(--glow)', lineHeight: 1 }}>
                  ${(bid.priceCents / 100).toLocaleString('en-US')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>
                  {bid.timelineWeeks} weeks
                </div>
              </div>
              <div className="vt-tag" style={{ borderColor: bid.status === 'accepted' ? 'var(--accent)' : undefined, color: bid.status === 'accepted' ? 'var(--accent)' : undefined }}>
                {bid.status}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
