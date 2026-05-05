import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';

export const metadata = { title: 'Sent bids · VisaTrack' };

export default async function SentBidsPage() {
  const session = await getSession();
  if (!session || session.kind !== 'firm') redirect('/login?role=firm');
  const bids = await store.listBidsByFirm(session.firmId);
  const enriched = await Promise.all(
    bids.map(async (b) => ({ bid: b, c: await store.getCase(b.caseId) })),
  );
  enriched.sort((a, b) => Date.parse(b.bid.submittedAt) - Date.parse(a.bid.submittedAt));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">Marketplace</span>
        <span>{bids.length} bid{bids.length === 1 ? '' : 's'} sent</span>
      </div>
      <h1 className="serif" style={{ fontWeight: 500, fontSize: 'clamp(32px, 4.5vw, 48px)', margin: '0 0 36px' }}>
        Sent bids
      </h1>
      {enriched.length === 0 ? (
        <div className="vt-card">
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            No bids yet. <Link href={'/marketplace' as never} className="vt-link">Browse the inbox →</Link>
          </p>
        </div>
      ) : (
        <table className="vt-table">
          <thead>
            <tr>
              <th>Stage name</th>
              <th>Genre</th>
              <th>Sent</th>
              <th style={{ textAlign: 'right' }}>Fee</th>
              <th>Timeline</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {enriched.map(({ bid, c }) => (
              <tr key={bid.id}>
                <td>{c?.intakeData?.stage_name || `Case #${bid.caseId.slice(0, 6).toUpperCase()}`}</td>
                <td style={{ color: 'var(--ink-2)' }}>{c?.intakeData?.genre || '—'}</td>
                <td style={{ color: 'var(--muted)' }}>{new Date(bid.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                <td style={{ textAlign: 'right' }} className="serif">${(bid.priceCents / 100).toLocaleString('en-US')}</td>
                <td>{bid.timelineWeeks} wk</td>
                <td>
                  <span className="vt-tag" style={{
                    borderColor: bid.status === 'accepted' ? 'var(--accent)' : undefined,
                    color: bid.status === 'accepted' ? 'var(--accent)' : undefined,
                  }}>
                    {bid.status}
                  </span>
                </td>
                <td>
                  {c ? (
                    bid.status === 'accepted' ? (
                      <Link href={`/cases/${c.id}` as never} className="vt-link">Open case →</Link>
                    ) : (
                      <Link href={`/marketplace/${c.id}` as never} className="vt-link">View →</Link>
                    )
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
