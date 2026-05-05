import { notFound } from 'next/navigation';
import { DarkHeader } from '@/components/marketplace/dark-header';
import {
  AuditPricingCard,
  PreviewCountdown,
  AddonButton,
} from '@/components/marketplace/audit-cta';
import {
  PreviewQualityBadge,
  CriteriaBars,
  PreviewExhibits,
} from '@/components/marketplace/dossier-preview';
import {
  ScoreCard,
  CriterionBreakdown,
  Recommendations,
  ConciergeCallSection,
  MatchCTA,
  UpsellSidebar,
  FullDossier,
} from '@/components/marketplace/dossier-audited';
import { store, PREVIEW_WINDOW_MS } from '@/lib/store';
import { PRICING } from '@/lib/pricing';

export default async function DossierPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const c = await store.getCase(caseId);
  if (!c) notFound();
  const stage = c.intakeData?.stage_name || 'your';
  const audit = await store.getActiveAuditForCase(caseId);
  const latestAudit = await store.getLatestAuditForCase(caseId);
  const addons = await store.listAddonsForCase(caseId);

  const isPreview =
    c.status === 'dossier_preview' || c.status === 'dossier_ready'; // legacy
  const isAudited = c.status === 'audited' && !!audit;
  const isExpired = c.status === 'audit_expired';

  return (
    <>
      <DarkHeader
        steps={[
          { label: '01 · Intake' },
          { label: '02 · Dossier', active: true },
          { label: '03 · Counsel' },
        ]}
      />
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 28px 120px' }}>
        <div className="vt-filebar">
          <span className="vt-pill">File No. 02–C</span>
          <span>
            {isAudited
              ? 'Full Audit Dossier'
              : isExpired
                ? 'Audit Expired'
                : 'Lite Preview'}
          </span>
          {isPreview ? (
            <span style={{ color: 'var(--accent)' }}>
              <PreviewCountdown
                expiresAt={Date.parse(c.createdAt) + PREVIEW_WINDOW_MS}
              />
            </span>
          ) : null}
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
          <em
            style={{
              fontStyle: 'italic',
              color: 'var(--accent)',
              textShadow: 'var(--glow)',
              fontWeight: 400,
            }}
          >
            O-1B dossier
          </em>{' '}
          {isAudited ? 'is unlocked.' : isExpired ? 'is locked.' : 'is ready.'}
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: '70ch', margin: '0 0 32px' }}>
          {isAudited
            ? 'Numerical score, sourced exhibits, criterion breakdown, and 3 specific actions to lift your score. Listing is free — vetted firms claim from here.'
            : isExpired
              ? 'Your free preview window closed. Re-audit for $9 to refresh evidence and unlock the full dossier.'
              : `Found across the open web in ~5 minutes. Below is a free preview — quality at a glance, exhibits summarized. Unlock the full audit to see sources, the numerical score, and 3 specific actions to lift it.`}
        </p>

        {isExpired ? <ExpiredView caseId={c.id} /> : null}

        {isPreview ? <PreviewView c={c} caseId={c.id} /> : null}

        {isAudited && audit ? (
          <AuditedView c={c} caseId={c.id} audit={audit} addons={addons} />
        ) : null}

        {!isPreview && !isAudited && !isExpired ? (
          <FallbackView c={c} latestAudit={latestAudit} />
        ) : null}
      </main>
    </>
  );
}

function PreviewView({ c, caseId }: { c: import('@/lib/store').ArtistCase; caseId: string }) {
  return (
    <>
      <PreviewQualityBadge score={c.evidenceScore} />
      <CriteriaBars coverage={c.criteriaCoverage} locked={true} />
      <div style={{ marginTop: 24 }}>
        <PreviewExhibits c={c} />
      </div>
      <AuditPricingCard
        caseId={caseId}
        standardCents={PRICING.audit.standard}
        conciergeCents={PRICING.audit.concierge}
      />
    </>
  );
}

function ExpiredView({ caseId }: { caseId: string }) {
  return (
    <div
      className="vt-card"
      style={{
        borderColor: '#ff5c8a',
        background: 'rgba(255,92,138,.05)',
        marginBottom: 32,
      }}
    >
      <div className="vt-section-eyebrow" style={{ color: '#ff5c8a' }}>
        ⚠ Audit expired
      </div>
      <h2 className="serif" style={{ fontWeight: 500, fontSize: 28, margin: '0 0 12px' }}>
        Your audit window closed.
      </h2>
      <p style={{ color: 'var(--ink-2)', margin: '0 0 24px', maxWidth: '60ch' }}>
        Re-audit refreshes evidence (catches new press, new chart placements) and re-opens the
        full dossier + listing eligibility for another 90 days.
      </p>
      <div style={{ maxWidth: 320 }}>
        <AddonButton
          caseId={caseId}
          kind="re_audit"
          label="Re-audit"
          priceCents={PRICING.audit_addons.re_audit}
          variant="cta"
        />
      </div>
    </div>
  );
}

function AuditedView({
  c,
  caseId,
  audit,
  addons,
}: {
  c: import('@/lib/store').ArtistCase;
  caseId: string;
  audit: import('@/lib/store').ArtistAudit;
  addons: import('@/lib/store').AuditAddon[];
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: 32,
        alignItems: 'start',
      }}
    >
      <div>
        <ScoreCard score={c.evidenceScore} />
        <CriterionBreakdown coverage={c.criteriaCoverage} />
        <Recommendations caseId={caseId} score={c.evidenceScore} />
        {audit.tier === 'concierge' ? <ConciergeCallSection /> : null}
        <FullDossier c={c} />
        <MatchCTA caseId={caseId} />
      </div>
      <UpsellSidebar caseId={caseId} audit={audit} addons={addons} caseStatus={c.status} />
    </div>
  );
}

function FallbackView({
  c,
  latestAudit,
}: {
  c: import('@/lib/store').ArtistCase;
  latestAudit: import('@/lib/store').ArtistAudit | undefined;
}) {
  // Cases that have moved beyond audited (listed/claimed/etc.) — show the
  // post-audit dossier view. Treat them as audited for rendering purposes.
  if (latestAudit && !latestAudit.refundedAt) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 32,
          alignItems: 'start',
        }}
      >
        <div>
          <ScoreCard score={c.evidenceScore} />
          <CriterionBreakdown coverage={c.criteriaCoverage} />
          <Recommendations caseId={c.id} score={c.evidenceScore} />
          <FullDossier c={c} />
        </div>
        <UpsellSidebar caseId={c.id} audit={latestAudit} addons={[]} caseStatus={c.status} />
      </div>
    );
  }
  return (
    <div className="vt-card" style={{ padding: 24 }}>
      <div className="vt-section-eyebrow">Dossier compiling…</div>
      <p style={{ color: 'var(--ink-2)', margin: 0 }}>
        Your dossier is still being assembled. Refresh in a moment.
      </p>
    </div>
  );
}
