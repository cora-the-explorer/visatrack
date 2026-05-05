import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store, unlockFeeCentsForCase, pricingBandForScore } from '@/lib/store';
import { coverageCount } from '@/lib/mock-evidence';
import { ClaimButton } from '@/components/marketplace/claim-button';

export const metadata = { title: 'Marketplace · VisaTrack' };

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

export default async function MarketplaceInboxPage() {
  const session = await getSession();
  if (!session || session.kind !== 'firm') redirect('/login?role=firm');

  const open = await store.listOpenCases();
  // Hide cases this firm already claimed (any status).
  const myClaims = await store.listClaimsByFirm(session.firmId);
  const myCaseIds = new Set(myClaims.map((c) => c.caseId));
  // listOpenCases already filters to status=listed, so cases active-claimed
  // by other firms (status=claimed) are naturally excluded.
  const visible = open.filter((c) => !myCaseIds.has(c.id));

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">Marketplace</span>
        <span>{visible.length} dossier{visible.length === 1 ? '' : 's'} available to claim</span>
      </div>
      <h1
        className="serif"
        style={{
          fontWeight: 500,
          fontSize: 'clamp(32px, 4.5vw, 52px)',
          margin: '0 0 14px',
          letterSpacing: '-0.025em',
        }}
      >
        Inbox
      </h1>
      <p style={{ color: 'var(--ink-2)', maxWidth: '60ch', margin: '0 0 36px' }}>
        Pre-built O-1B dossiers from artists who are ready to file. First eligible firm to claim
        wins exclusive 7-day engagement. Flat unlock fee — no auctions.
      </p>

      {visible.length === 0 ? (
        <div className="vt-card">
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            No open dossiers right now. We'll email you the moment one matches your specialties.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {visible.map((c) => {
            const stage = c.intakeData?.stage_name || 'Anonymous';
            const handle = `Artist #${c.id.slice(0, 4).toUpperCase()}`;
            const genre = c.intakeData?.genre || 'unspecified';
            const unlock = unlockFeeCentsForCase(c);
            const band = pricingBandForScore(c.evidenceScore);
            return (
              <div key={c.id} className="vt-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <Link
                  href={`/marketplace/${c.id}` as never}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div className="vt-section-eyebrow">{handle}</div>
                  <h3>
                    {stage}
                    <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8, fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                      · {genre}
                    </span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '14px 0 16px' }}>
                    <Stat n={String(c.evidenceScore ?? '—')} l="Score" />
                    <Stat n={`${coverageCount(c.criteriaCoverage)}/8`} l="Criteria" />
                    <Stat n={c.budgetBand || '—'} l="Budget" />
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 10 }}>
                    📍 {c.location || 'Location not specified'} · ⏱ Target {c.targetVisaDate ? new Date(c.targetVisaDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
                    {band} band · {fmt$(unlock)} unlock
                  </div>
                  {c.briefNote ? (
                    <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 14 }}>
                      "{c.briefNote.slice(0, 110)}{c.briefNote.length > 110 ? '…' : ''}"
                    </div>
                  ) : null}
                </Link>
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--rule)' }}>
                  <ClaimButton caseId={c.id} unlockFeeCents={unlock} block />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="serif" style={{ fontSize: 22, color: 'var(--accent)', textShadow: 'var(--glow-soft)', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>{l}</div>
    </div>
  );
}
