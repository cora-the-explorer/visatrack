import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { store, ENGAGEMENT_WINDOW_MS } from '@/lib/store';

export const metadata = { title: 'Claimed cases · VisaTrack' };

const fmt$ = (cents: number) => `$${(cents / 100).toLocaleString('en-US')}`;

function daysRemaining(claimedAt: string): number {
  const elapsed = Date.now() - Date.parse(claimedAt);
  return Math.max(0, Math.ceil((ENGAGEMENT_WINDOW_MS - elapsed) / 86_400_000));
}

export default async function ClaimedCasesPage() {
  const session = await getSession();
  if (!session || session.kind !== 'firm') redirect('/login?role=firm');
  const claims = await store.listClaimsByFirm(session.firmId);
  const enriched = await Promise.all(
    claims.map(async (cl) => ({ claim: cl, c: await store.getCase(cl.caseId) })),
  );
  enriched.sort((a, b) => Date.parse(b.claim.claimedAt) - Date.parse(a.claim.claimedAt));

  const score = await store.getFirmScore(session.firmId);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 28px 96px' }}>
      <div className="vt-filebar">
        <span className="vt-pill">Marketplace</span>
        <span>{claims.length} claim{claims.length === 1 ? '' : 's'}</span>
      </div>
      <h1 className="serif" style={{ fontWeight: 500, fontSize: 'clamp(32px, 4.5vw, 48px)', margin: '0 0 12px' }}>
        Claimed cases
      </h1>
      {score ? (
        <p style={{ color: 'var(--ink-2)', margin: '0 0 28px', fontSize: 13 }}>
          Firm score: <b>{score.score}</b>/100 · {score.engagedWithinWindow}/{score.claimsTotal}{' '}
          claims engaged within the 7-day window.
        </p>
      ) : null}
      {enriched.length === 0 ? (
        <div className="vt-card">
          <p style={{ margin: 0, color: 'var(--ink-2)' }}>
            No claims yet. <Link href={'/marketplace' as never} className="vt-link">Browse the inbox →</Link>
          </p>
        </div>
      ) : (
        <table className="vt-table">
          <thead>
            <tr>
              <th>Stage name</th>
              <th>Genre</th>
              <th>Claimed</th>
              <th style={{ textAlign: 'right' }}>Unlock</th>
              <th>Status</th>
              <th>Window</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {enriched.map(({ claim, c }) => {
              const remaining = daysRemaining(claim.claimedAt);
              return (
                <tr key={claim.id}>
                  <td>{c?.intakeData?.stage_name || `Case #${claim.caseId.slice(0, 6).toUpperCase()}`}</td>
                  <td style={{ color: 'var(--ink-2)' }}>{c?.intakeData?.genre || '—'}</td>
                  <td style={{ color: 'var(--muted)' }}>
                    {new Date(claim.claimedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ textAlign: 'right' }} className="serif">
                    {fmt$(claim.unlockFeeCents)}
                  </td>
                  <td>
                    <span
                      className="vt-tag"
                      style={{
                        borderColor:
                          claim.status === 'engaged'
                            ? 'var(--accent)'
                            : claim.status === 'released'
                              ? 'var(--rule)'
                              : undefined,
                        color:
                          claim.status === 'engaged'
                            ? 'var(--accent)'
                            : claim.status === 'released'
                              ? 'var(--muted)'
                              : undefined,
                      }}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--ink-2)' }}>
                    {claim.status === 'active'
                      ? `${remaining}d left`
                      : claim.status === 'engaged'
                        ? 'engaged'
                        : claim.status === 'released'
                          ? 'released'
                          : '—'}
                  </td>
                  <td>
                    {c ? (
                      <Link href={`/cases/${c.id}` as never} className="vt-link">
                        Open case →
                      </Link>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
