import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';
import { DossierGrid, DossierStats } from '@/components/marketplace/dossier-view';
import { BidForm } from '@/components/marketplace/bid-form';

export default async function MarketplaceCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const session = await getSession();
  if (!session || session.kind !== 'firm') redirect('/login?role=firm');
  const { caseId } = await params;
  const c = await store.getCase(caseId);
  if (!c) notFound();
  if (c.status !== 'listed' && c.status !== 'matched') notFound();

  const myBids = await store.listBidsByFirm(session.firmId);
  const existing = myBids.find((b) => b.caseId === caseId);
  const stage = c.intakeData?.stage_name || `Artist #${c.id.slice(0, 4).toUpperCase()}`;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px 96px' }}>
      <Link href={'/marketplace' as never} className="vt-link" style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        ← Inbox
      </Link>
      <div className="vt-filebar" style={{ marginTop: 16 }}>
        <span className="vt-pill">Marketplace</span>
        <span>Case #{c.id.slice(0, 8).toUpperCase()}</span>
      </div>
      <h1 className="serif" style={{ fontWeight: 500, fontSize: 'clamp(32px, 4.5vw, 48px)', margin: '0 0 16px' }}>
        {stage}
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: 32,
          alignItems: 'start',
        }}
      >
        <div>
          <DossierStats c={c} />
          <DossierGrid c={c} locked={false} />
        </div>
        <aside style={{ position: 'sticky', top: 24 }}>
          <div className="vt-card" style={{ marginBottom: 16 }}>
            <div className="vt-section-eyebrow">Firm-only notes</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
              <div><b>Target visa date:</b> {c.targetVisaDate ? new Date(c.targetVisaDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'}</div>
              <div><b>Location:</b> {c.location || '—'}</div>
              <div><b>Budget:</b> {c.budgetBand || '—'}</div>
              <div><b>Genre:</b> {c.intakeData?.genre || '—'}</div>
              <div><b>Citizenship:</b> {c.intakeData?.citizenship || '—'}</div>
            </div>
            {c.briefNote ? (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--rule)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-2)' }}>
                "{c.briefNote}"
              </div>
            ) : null}
          </div>
          {c.status === 'matched' ? (
            <div className="vt-card">
              <div className="vt-section-eyebrow">Closed</div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                This case has been matched with another firm.
              </p>
            </div>
          ) : existing ? (
            <div className="vt-card">
              <div className="vt-section-eyebrow accent">Your bid · {existing.status}</div>
              <p style={{ margin: '0 0 8px' }}>
                ${(existing.priceCents / 100).toLocaleString('en-US')} · {existing.timelineWeeks} weeks
              </p>
              <Link href={'/marketplace/sent' as never} className="vt-link">
                View in sent →
              </Link>
            </div>
          ) : (
            <BidForm caseId={c.id} />
          )}
        </aside>
      </div>
    </div>
  );
}
