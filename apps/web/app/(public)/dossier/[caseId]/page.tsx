import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DarkHeader } from '@/components/marketplace/dark-header';
import { DossierGrid, DossierStats } from '@/components/marketplace/dossier-view';
import { store } from '@/lib/store';

export default async function DossierPreviewPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const c = await store.getCase(caseId);
  if (!c) notFound();
  const stage = c.intakeData?.stage_name || 'your';

  return (
    <>
      <DarkHeader
        steps={[
          { label: '01 · Intake' },
          { label: '02 · Dossier', active: true },
          { label: '03 · Counsel' },
        ]}
      />
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '48px 28px 120px' }}>
        <div className="vt-filebar">
          <span className="vt-pill">File No. 02–C</span>
          <span>Lite Evidence Package</span>
        </div>
        <h1
          className="serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(36px, 5.4vw, 60px)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
            margin: '0 0 8px',
          }}
        >
          {stage === 'your' ? 'Your' : `${stage}'s`}{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--accent)', textShadow: 'var(--glow)', fontWeight: 400 }}>
            O-1B dossier
          </em>{' '}
          is ready.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: '70ch', margin: '0 0 48px' }}>
          90 seconds. {c.evidenceData?.briefSummary.length || 8} criteria mapped.{' '}
          {c.evidenceData?.testimonials.length || 8} expert letter drafts. The same file an
          attorney bills $11,400 to assemble — done. Below: a preview. Get matched with a vetted
          firm to unlock everything and file.
        </p>

        <DossierStats c={c} />

        <DossierGrid c={c} locked={true} />

        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            borderTop: '1px solid var(--accent)',
            borderBottom: '1px solid var(--accent)',
            margin: '64px 0',
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 700 }}>
            × Ready to file? Let firms compete for your case ×
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '24px 0 80px' }}>
          <h2
            className="serif"
            style={{
              fontWeight: 500,
              fontSize: 'clamp(36px, 5vw, 56px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: '0 0 24px',
            }}
          >
            Get matched with a{' '}
            <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)' }}>firm</em>
          </h2>
          <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: '60ch', margin: '0 auto 36px' }}>
            We send your dossier to vetted O-1B specialists. Within 48 hours you'll see fixed-fee
            bids — price, timeline, who'd handle your case. You pick. They file. No cold calls.
          </p>
          <Link href={`/match/${c.id}` as never} className="vt-cta">
            Get matched with a firm
            <span style={{ fontSize: 18 }}>→</span>
          </Link>
          <div style={{ marginTop: 14, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            No upfront cost · You can decline any match
          </div>
        </div>
      </main>
    </>
  );
}
