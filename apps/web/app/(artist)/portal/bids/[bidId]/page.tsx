import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';
import { BidActions } from '@/components/marketplace/bid-actions';

export default async function BidDetailPage({ params }: { params: Promise<{ bidId: string }> }) {
  const session = await getSession();
  if (!session || session.kind !== 'artist') redirect('/login?role=artist');
  const { bidId } = await params;
  const bid = await store.getBid(bidId);
  if (!bid) notFound();
  const c = await store.getCase(bid.caseId);
  if (!c || c.artistId !== session.artistId) notFound();
  const firm = await store.getFirm(bid.firmId);
  if (!firm) notFound();

  const handoff = await store.getHandoffForCase(c.id);

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '48px 28px 96px' }}>
      <Link href={'/portal/bids' as never} className="vt-link" style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        ← All bids
      </Link>
      <div className="vt-filebar" style={{ marginTop: 16 }}>
        <span className="vt-pill">Bid · {bid.status}</span>
        <span>Submitted {new Date(bid.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>

      <h1 className="serif" style={{ fontWeight: 500, fontSize: 'clamp(32px, 4.5vw, 48px)', margin: '0 0 18px' }}>
        {firm.displayName}
      </h1>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {(firm.specialties || []).slice(0, 4).map((s) => (
          <span key={s} className="vt-tag">{s}</span>
        ))}
        {firm.ailaMember ? <span className="vt-tag accent">AILA member</span> : null}
      </div>
      <p style={{ color: 'var(--ink-2)', maxWidth: '70ch', margin: '0 0 36px' }}>{firm.bio}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
        {[
          [`$${(bid.priceCents / 100).toLocaleString('en-US')}`, 'Fee'],
          [`${bid.timelineWeeks} wk`, 'Timeline'],
          [`${firm.casesHandled}`, 'O-1Bs handled'],
        ].map(([n, l]) => (
          <div key={String(l)} className="vt-stat">
            <div className="num">{n}</div>
            <div className="lbl">{l}</div>
          </div>
        ))}
      </div>

      <div className="vt-card" style={{ marginBottom: 24 }}>
        <div className="vt-section-eyebrow">The pitch</div>
        <p style={{ fontSize: 16, color: 'var(--ink)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{bid.pitch}</p>
      </div>

      {firm.feePhilosophy ? (
        <div className="vt-card" style={{ marginBottom: 24 }}>
          <div className="vt-section-eyebrow">Fee philosophy</div>
          <p style={{ margin: 0 }}>{firm.feePhilosophy}</p>
        </div>
      ) : null}

      {bid.status === 'pending' ? (
        <BidActions bidId={bid.id} />
      ) : bid.status === 'accepted' ? (
        <div className="vt-card accent">
          <div className="vt-section-eyebrow accent">✓ Accepted</div>
          <h2 className="serif" style={{ fontWeight: 500, fontSize: 26, margin: '0 0 8px' }}>You're matched.</h2>
          <p style={{ margin: '0 0 12px', color: 'var(--ink-2)' }}>
            We sent intros to both parties. {firm.contactName} will reach out from{' '}
            <a className="vt-link" href={`mailto:${firm.contactEmail}`}>{firm.contactEmail}</a>.
          </p>
          {handoff?.notes ? (
            <p style={{ margin: 0, color: 'var(--ink-2)' }}><b>Next steps:</b> {handoff.notes}</p>
          ) : null}
        </div>
      ) : (
        <div className="vt-card">
          <div className="vt-section-eyebrow">{bid.status}</div>
          <p style={{ margin: 0, color: 'var(--muted)' }}>This bid is closed.</p>
        </div>
      )}
    </div>
  );
}
