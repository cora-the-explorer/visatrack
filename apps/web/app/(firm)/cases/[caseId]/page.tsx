import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store, ENGAGEMENT_WINDOW_MS } from '@/lib/store';
import { DossierGrid, DossierStats } from '@/components/marketplace/dossier-view';
import { LogEngagementButton } from '@/components/marketplace/log-engagement-button';

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

function daysRemaining(claimedAt: string): number {
  const elapsed = Date.now() - Date.parse(claimedAt);
  return Math.max(0, Math.ceil((ENGAGEMENT_WINDOW_MS - elapsed) / 86_400_000));
}

export default async function FirmCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const session = await getSession();
  if (!session || session.kind !== 'firm') redirect('/login?role=firm');
  const { caseId } = await params;
  const c = await store.getCase(caseId);
  if (!c) notFound();
  const myClaims = await store.listClaimsByFirm(session.firmId);
  const claim = myClaims.find((cl) => cl.caseId === caseId);
  if (!claim) notFound();
  const artist = await store.getArtistById(c.artistId);
  const remaining = daysRemaining(claim.claimedAt);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px 96px' }}>
      <Link href={'/cases' as never} className="vt-link" style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        ← My cases
      </Link>
      <div className="vt-filebar" style={{ marginTop: 16 }}>
        <span className="vt-pill">Case · {claim.status}</span>
        <span>
          {fmt$(claim.unlockFeeCents)} unlock ·{' '}
          {claim.status === 'active' ? `${remaining}d left in engagement window` : claim.status}
        </span>
      </div>
      <h1 className="serif" style={{ fontWeight: 500, fontSize: 'clamp(32px, 4.5vw, 48px)', margin: '0 0 16px' }}>
        {c.intakeData?.stage_name || `Case ${c.id.slice(0, 8)}`}
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
        <aside>
          <div className="vt-card">
            <div className="vt-section-eyebrow">Artist contact</div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink-2)' }}>
              <div><b>Legal name:</b> {artist?.legalName || '—'}</div>
              <div><b>Stage name:</b> {artist?.stageName || '—'}</div>
              <div>
                <b>Email:</b>{' '}
                <a className="vt-link" href={`mailto:${artist?.email || ''}`}>
                  {artist?.email || '—'}
                </a>
              </div>
              <div><b>Phone:</b> {artist?.phone || '—'}</div>
              <div><b>Citizenship:</b> {artist?.citizenship || '—'}</div>
              <div><b>Based in:</b> {artist?.basedIn || '—'}</div>
            </div>
          </div>
          <div className="vt-card" style={{ marginTop: 16 }}>
            <div className="vt-section-eyebrow">Engagement</div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: 'var(--ink-2)' }}>
              <div><b>Unlock fee:</b> {fmt$(claim.unlockFeeCents)}</div>
              <div><b>Claimed:</b> {new Date(claim.claimedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
              <div><b>Status:</b> {claim.status}</div>
              {claim.engagedAt ? (
                <div><b>First engagement:</b> {new Date(claim.engagedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
              ) : null}
              {claim.releasedAt ? (
                <div><b>Released:</b> {new Date(claim.releasedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
              ) : null}
            </div>
            {claim.status === 'active' ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--muted)' }}>
                  You have {remaining} day{remaining === 1 ? '' : 's'} to log first contact with
                  the artist before this claim auto-releases.
                </p>
                <LogEngagementButton claimId={claim.id} />
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
