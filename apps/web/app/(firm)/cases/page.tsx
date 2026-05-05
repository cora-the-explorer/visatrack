import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store, ENGAGEMENT_WINDOW_MS } from '@/lib/store';

export const metadata = { title: 'My cases · VisaTrack' };

const STAGES = [
  { key: 'engaged', label: 'Engaged' },
  { key: 'evidence', label: 'Evidence in' },
  { key: 'drafting', label: 'Drafting' },
  { key: 'review', label: 'Review' },
  { key: 'filed', label: 'Filed' },
] as const;

type Stage = (typeof STAGES)[number]['key'];

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

function daysRemaining(claimedAt: string): number {
  const elapsed = Date.now() - Date.parse(claimedAt);
  return Math.max(0, Math.ceil((ENGAGEMENT_WINDOW_MS - elapsed) / 86_400_000));
}

export default async function MyCasesPage() {
  const session = await getSession();
  if (!session || session.kind !== 'firm') redirect('/login?role=firm');
  const myClaims = await store.listClaimsByFirm(session.firmId);
  // Cases the firm is currently working: active or engaged claims.
  const open = myClaims.filter((c) => c.status === 'active' || c.status === 'engaged');
  const cases = await Promise.all(
    open.map(async (cl) => ({ claim: cl, c: await store.getCase(cl.caseId) })),
  );
  const valid = cases.filter((x) => !!x.c) as {
    claim: typeof open[number];
    c: NonNullable<Awaited<ReturnType<typeof store.getCase>>>;
  }[];

  // All claims start in the Engaged lane on claim. Future case-page
  // transitions can move things along once filing UI lands.
  const lanes: Record<Stage, typeof valid> = {
    engaged: [],
    evidence: [],
    drafting: [],
    review: [],
    filed: [],
  };
  valid.forEach((x) => {
    lanes.engaged.push(x);
  });

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: '40px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">Cases</span>
        <span>{valid.length} engagement{valid.length === 1 ? '' : 's'}</span>
      </div>
      <h1 className="serif" style={{ fontWeight: 500, fontSize: 'clamp(32px, 4.5vw, 48px)', margin: '0 0 36px' }}>
        My cases
      </h1>
      {valid.length === 0 ? (
        <div className="vt-card">
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            You haven't claimed a case yet. <Link href={'/marketplace' as never} className="vt-link">Browse the marketplace →</Link>
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 16 }}>
          {STAGES.map((stage) => (
            <div key={stage.key} style={{ background: '#0e0e0e', border: '1px solid var(--rule)', padding: 14, minHeight: 360 }}>
              <div className="vt-section-eyebrow">{stage.label}</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {(lanes[stage.key] || []).map(({ claim, c }) => (
                  <Link
                    key={claim.id}
                    href={`/cases/${c.id}` as never}
                    className="vt-card"
                    style={{ padding: 14, textDecoration: 'none', display: 'block' }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {c.intakeData?.stage_name || c.id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      {fmt$(claim.unlockFeeCents)} unlock ·{' '}
                      {claim.status === 'engaged'
                        ? 'engaged'
                        : `${daysRemaining(claim.claimedAt)}d left`}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
