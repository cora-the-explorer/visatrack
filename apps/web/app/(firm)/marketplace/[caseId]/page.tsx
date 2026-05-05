import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store, unlockFeeCentsForCase, pricingBandForScore } from '@/lib/store';
import { DossierGrid, DossierStats } from '@/components/marketplace/dossier-view';
import { ClaimButton } from '@/components/marketplace/claim-button';

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

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
  if (
    c.status !== 'listed' &&
    c.status !== 'claimed' &&
    c.status !== 'matched' &&
    c.status !== 'released_back'
  ) {
    notFound();
  }

  const myClaims = await store.listClaimsByFirm(session.firmId);
  const mine = myClaims.find((cl) => cl.caseId === caseId);
  const activeClaim = await store.getActiveClaimForCase(caseId);
  const claimedByOther = activeClaim && activeClaim.firmId !== session.firmId;
  const stage = c.intakeData?.stage_name || `Artist #${c.id.slice(0, 4).toUpperCase()}`;

  const unlockFeeCents = unlockFeeCentsForCase(c);
  const band = pricingBandForScore(c.evidenceScore);
  const artist = mine ? await store.getArtistById(c.artistId) : undefined;

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

          {mine && artist ? (
            <div className="vt-card accent">
              <div className="vt-section-eyebrow accent">✓ Your claim</div>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-2)' }}>
                Status: <b>{mine.status}</b> · {fmt$(mine.unlockFeeCents)} unlock
              </p>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.8, marginBottom: 12 }}>
                <div><b>Artist:</b> {artist.legalName || artist.stageName || '—'}</div>
                <div><b>Email:</b> <a className="vt-link" href={`mailto:${artist.email}`}>{artist.email}</a></div>
                <div><b>Phone:</b> {artist.phone || '—'}</div>
              </div>
              <Link href={`/cases/${c.id}` as never} className="vt-link">
                Open in case console →
              </Link>
            </div>
          ) : claimedByOther ? (
            <div className="vt-card">
              <div className="vt-section-eyebrow">Claimed</div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                Another firm claimed this case. It will return to the pool if not engaged within 7
                days.
              </p>
            </div>
          ) : c.status === 'listed' ? (
            <div className="vt-card accent" style={{ background: '#1a1a1a' }}>
              <div className="vt-section-eyebrow accent">Claim — {band} band</div>
              <h3 style={{ margin: '0 0 8px' }}>{fmt$(unlockFeeCents)}</h3>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                Flat unlock fee. First eligible firm wins exclusive 7-day engagement window. If
                you don't log first contact with the artist within 7 days, the case auto-releases
                back to the pool (no refund).
              </p>
              <ul style={{ margin: '0 0 14px 18px', padding: 0, color: 'var(--ink-2)', fontSize: 12, lineHeight: 1.7 }}>
                <li>Artist contact unlocks immediately on claim</li>
                <li>Other firms see this case removed from their inbox</li>
                <li>You keep 100% of legal fees</li>
              </ul>
              <ClaimButton caseId={c.id} unlockFeeCents={unlockFeeCents} block />
            </div>
          ) : (
            <div className="vt-card">
              <div className="vt-section-eyebrow">Closed</div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                This case is not currently available.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
