import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store } from '@/lib/store';
import { DossierGrid, DossierStats } from '@/components/marketplace/dossier-view';

export default async function PortalDossierPage() {
  const session = await getSession();
  if (!session || session.kind !== 'artist') redirect('/login?role=artist');
  const cases = await store.listCasesByArtist(session.artistId);
  const c = cases[cases.length - 1];
  if (!c) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '64px 28px' }}>
        <h1 className="serif" style={{ fontSize: 36 }}>No dossier yet</h1>
      </div>
    );
  }
  const bids = await store.listBidsForCase(c.id);
  const accepted = bids.find((b) => b.status === 'accepted');
  const locked = !accepted;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">Dossier</span>
        <span>{locked ? 'Locked preview' : 'Fully unlocked'}</span>
      </div>
      <h1
        className="serif"
        style={{
          fontWeight: 500,
          fontSize: 'clamp(32px, 4.5vw, 48px)',
          margin: '0 0 16px',
        }}
      >
        Your O-1B dossier
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '60ch', margin: '0 0 36px' }}>
        {locked
          ? 'Preview only. Accept a firm bid to unlock the full file (contracts, complete brief, all expert letters).'
          : 'Fully unlocked — your matched firm has the same view.'}
      </p>
      <DossierStats c={c} />
      <DossierGrid c={c} locked={locked} />
    </div>
  );
}
