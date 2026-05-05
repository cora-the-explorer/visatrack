import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';
import { DossierGrid, DossierStats } from '@/components/marketplace/dossier-view';

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
  const myBids = await store.listBidsByFirm(session.firmId);
  const accepted = myBids.find((b) => b.caseId === caseId && b.status === 'accepted');
  if (!accepted) notFound();
  const artist = await store.getArtistById(c.artistId);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px 96px' }}>
      <Link href={'/cases' as never} className="vt-link" style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
        ← My cases
      </Link>
      <div className="vt-filebar" style={{ marginTop: 16 }}>
        <span className="vt-pill">Case · engaged</span>
        <span>${(accepted.priceCents / 100).toLocaleString('en-US')} · {accepted.timelineWeeks} weeks</span>
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
              <div><b>Fee:</b> ${(accepted.priceCents / 100).toLocaleString('en-US')}</div>
              <div><b>Timeline:</b> {accepted.timelineWeeks} weeks</div>
              <div><b>Decided:</b> {accepted.decidedAt ? new Date(accepted.decidedAt).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
