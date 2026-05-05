import { redirect } from 'next/navigation';
import { store } from '@/lib/store';

// v3 audit funnel — listing requires an audit. The /match page collects the
// listing details and POSTs to /api/cases/:id/list, which would 402 anyway
// for non-audited cases. Redirecting here keeps the artist out of a dead-end
// form and points them at the audit purchase first.
export default async function MatchGuard({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const c = await store.getCase(caseId);
  if (!c) return <>{children}</>;
  const audit = await store.getActiveAuditForCase(caseId);
  const ok = c.status === 'audited' && !!audit;
  if (!ok) {
    const reason =
      c.status === 'audit_expired'
        ? 'audit_expired'
        : c.status === 'dossier_preview'
          ? 'audit_required'
          : 'audit_required';
    redirect(`/dossier/${caseId}?from=match&reason=${reason}`);
  }
  return <>{children}</>;
}
