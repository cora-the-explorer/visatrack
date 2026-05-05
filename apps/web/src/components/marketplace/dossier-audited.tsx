import Link from 'next/link';
import type { ArtistCase, ArtistAudit, AuditAddon } from '@/lib/store';
import type { CriteriaCoverage } from '@/lib/store';
import { DossierGrid } from './dossier-view';
import { AddonButton } from './audit-cta';
import { PRICING } from '@/lib/pricing';

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

const CRITERION_LABELS: Record<keyof CriteriaCoverage, string> = {
  awards: 'Awards',
  press: 'Press',
  judging: 'Judging',
  originalContributions: 'Original Contributions',
  authorship: 'Authorship',
  leadingRole: 'Leading Role',
  highSalary: 'High Salary',
  commercialSuccess: 'Commercial Success',
};

export function ScoreCard({ score }: { score: number | undefined }) {
  const display = score ?? 0;
  return (
    <div className="vt-card accent" style={{ marginBottom: 24, textAlign: 'center' }}>
      <div className="vt-section-eyebrow accent">Evidence score</div>
      <div
        className="serif"
        style={{
          fontSize: 96,
          fontWeight: 500,
          lineHeight: 1,
          color: 'var(--accent)',
          textShadow: 'var(--glow)',
          margin: '8px 0',
        }}
      >
        {display}
        <span style={{ fontSize: 32, color: 'var(--muted)' }}> / 100</span>
      </div>
      <p style={{ color: 'var(--ink-2)', margin: 0, fontSize: 13 }}>
        Computed from press, charts, contracts, expert testimonials, and criterion coverage.
      </p>
    </div>
  );
}

export function CriterionBreakdown({
  coverage,
}: {
  coverage: CriteriaCoverage | undefined;
}) {
  const entries = (Object.keys(CRITERION_LABELS) as (keyof CriteriaCoverage)[]).map((k) => ({
    key: k,
    label: CRITERION_LABELS[k],
    on: coverage?.[k] ?? false,
  }));
  return (
    <div className="vt-card" style={{ marginBottom: 24 }}>
      <div className="vt-section-eyebrow">§ Criterion breakdown</div>
      <h3>O-1B criteria — your coverage</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
        {entries.map((e) => (
          <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 3,
                background: e.on ? 'var(--accent)' : '#1f1f1f',
                border: e.on ? '1px solid var(--accent)' : '1px solid var(--rule)',
                boxShadow: e.on ? '0 0 8px rgba(57,255,138,.5)' : undefined,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              {e.label}
              {e.on ? '' : ' — needs strengthening'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Recommendations({ caseId, score }: { caseId: string; score: number | undefined }) {
  // Mock content tied to evidence findings — deterministic enough to feel real.
  const tail = caseId.slice(0, 2);
  const idx = parseInt(tail, 16) % 3;
  const sets = [
    [
      'Add a published critical review from a tier-1 outlet (Pitchfork, Variety, Resident Advisor).',
      'Surface a signed booking contract from a major US festival — moves you firmly into the high-salary band.',
      'Convert one of your draft testimonials into a signed expert letter on letterhead.',
    ],
    [
      'Document a judging or selection-committee role — the criterion is currently empty.',
      'Add an original contributions exhibit (production credit, signature track, label catalogue note).',
      'Get one more contract above the genre median to firm up the high-salary criterion.',
    ],
    [
      'Resurface long-form press features into the press archive with explicit publication dates.',
      'Add a screenshot + URL for your top chart placement — sources currently rely on aggregator data.',
      'Collect a recommendation letter from a label founder or head-of-A&R type to anchor "leading role".',
    ],
  ];
  const items = sets[idx] ?? sets[0]!;
  const rfe = (score ?? 0) < 80;
  return (
    <div className="vt-card accent" style={{ marginBottom: 24 }}>
      <div className="vt-section-eyebrow accent">§ Recommendations</div>
      <h3>3 specific actions to lift your score</h3>
      <ol style={{ paddingLeft: 20, color: 'var(--ink-2)', fontSize: 14, lineHeight: 1.7, margin: '14px 0 0' }}>
        {items.map((it, i) => (
          <li key={i} style={{ marginBottom: 10 }}>
            {it}
          </li>
        ))}
      </ol>
      {rfe ? (
        <div
          style={{
            marginTop: 20,
            padding: '14px 18px',
            background: 'rgba(255,92,138,.08)',
            border: '1px solid rgba(255,92,138,.5)',
            borderRadius: 4,
          }}
        >
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#ff5c8a', marginBottom: 6 }}>
            ⚠ USCIS RFE risk flag
          </div>
          <p style={{ color: 'var(--ink-2)', fontSize: 13, margin: 0 }}>
            Profiles in this score band trigger Requests for Evidence in roughly 1 in 3 filings. The
            recommendations above directly address the most common RFE prompts.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function ConciergeCallSection() {
  return (
    <div className="vt-card accent" style={{ marginBottom: 24 }}>
      <div className="vt-section-eyebrow accent">★ Concierge tier</div>
      <h3>Schedule your 20-minute concierge call</h3>
      <p style={{ color: 'var(--ink-2)', fontSize: 13, margin: '0 0 18px' }}>
        Walk through the dossier with a reviewer. Live Q&amp;A on weak criteria, custom recommendation
        letter template, priority badge in the firm marketplace.
      </p>
      <button
        type="button"
        className="vt-cta"
        onClick={(e) => {
          e.preventDefault();
          alert(
            'Demo mode — concierge scheduling is a stub in Track A. Track B wires this to Cal.com.',
          );
        }}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        Pick a time → (demo)
      </button>
    </div>
  );
}

export function MatchCTA({ caseId }: { caseId: string }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 0',
        borderTop: '1px solid var(--accent)',
        borderBottom: '1px solid var(--accent)',
        margin: '48px 0',
      }}
    >
      <h2
        className="serif"
        style={{ fontWeight: 500, fontSize: 'clamp(28px, 4vw, 44px)', margin: '0 0 14px', letterSpacing: '-0.02em' }}
      >
        Ready to file?{' '}
        <em style={{ color: 'var(--accent)', textShadow: 'var(--glow)' }}>List your case</em>
      </h2>
      <p style={{ color: 'var(--ink-2)', maxWidth: '54ch', margin: '0 auto 24px', fontSize: 15 }}>
        Listing is free. The first eligible firm to claim your case wins exclusive 7-day
        engagement — flat unlock fee, no auctions, no losers.
      </p>
      <Link href={`/match/${caseId}` as never} className="vt-cta">
        Get matched with a firm →
      </Link>
    </div>
  );
}

export function UpsellSidebar({
  caseId,
  audit,
  addons,
  caseStatus,
}: {
  caseId: string;
  audit: ArtistAudit;
  addons: AuditAddon[];
  caseStatus: ArtistCase['status'];
}) {
  const has = (k: AuditAddon['kind']) => addons.some((a) => a.kind === k);
  const showRelist = caseStatus === 'released_back' && !has('relist_boost');
  const auditExpiresAt = Date.parse(audit.expiresAt);
  const days = Math.max(0, Math.ceil((auditExpiresAt - Date.now()) / 86_400_000));
  return (
    <aside className="vt-card" style={{ position: 'sticky', top: 24 }}>
      <div className="vt-section-eyebrow">§ Audit window</div>
      <h3>{days} day{days === 1 ? '' : 's'} remaining</h3>
      <p style={{ color: 'var(--ink-2)', fontSize: 13, margin: '0 0 24px' }}>
        Your {audit.tier === 'concierge' ? 'Audit + Concierge' : 'Standard Audit'} is valid until{' '}
        {new Date(audit.expiresAt).toLocaleDateString()}.
      </p>
      <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 16, marginBottom: 16 }}>
        <div className="vt-section-eyebrow" style={{ marginBottom: 12 }}>
          Add-ons
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {has('manager_kit') ? (
          <Pill label="Manager Kit · purchased" />
        ) : (
          <AddonButton
            caseId={caseId}
            kind="manager_kit"
            label="Manager Kit"
            priceCents={PRICING.audit_addons.manager_kit}
          />
        )}
        {has('express_evidence') ? null : (
          <AddonButton
            caseId={caseId}
            kind="express_evidence"
            label="Express Evidence (24h)"
            priceCents={PRICING.audit_addons.express_evidence}
          />
        )}
        {showRelist ? (
          <AddonButton
            caseId={caseId}
            kind="relist_boost"
            label="Re-list Boost"
            priceCents={PRICING.audit_addons.relist_boost}
          />
        ) : null}
      </div>
      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--muted)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
        Demo · no real charge
      </div>
    </aside>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '10px 14px',
        background: 'rgba(57,255,138,.08)',
        border: '1px solid rgba(57,255,138,.4)',
        borderRadius: 4,
        fontSize: 12,
        color: 'var(--accent)',
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  );
}

export function FullDossier({ c }: { c: ArtistCase }) {
  return <DossierGrid c={c} locked={false} />;
}
