'use client';

import { Check, ExternalLink, Loader2, X } from 'lucide-react';
import { Badge, Button, useToast } from '@visa-track/ui';
import { trpc } from '@/lib/trpc';

const STATUS_VARIANT: Record<
  'proposed' | 'accepted' | 'rejected' | 'needs_review',
  'default' | 'secondary' | 'muted' | 'destructive' | 'success'
> = {
  proposed: 'secondary',
  accepted: 'success',
  needs_review: 'muted',
  rejected: 'destructive',
};

function formatCategory(c: string): string {
  return c.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function strengthStars(n: number | null | undefined): string {
  const v = Math.max(0, Math.min(5, n ?? 0));
  return '★'.repeat(v) + '☆'.repeat(5 - v);
}

export function EvidenceTable({ caseId }: { caseId: string }) {
  const toast = useToast();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.evidence.listByCase.useQuery(caseId);
  const decide = trpc.evidence.decide.useMutation({
    onSuccess: (_data, vars) => {
      toast.show({
        variant: 'success',
        title: vars.decision === 'accepted' ? 'Evidence accepted' : 'Evidence rejected',
      });
      utils.evidence.listByCase.invalidate(caseId);
    },
    onError: (err) => {
      toast.show({ variant: 'error', title: 'Failed', description: err.message });
    },
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Loading evidence…</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
        No evidence proposed yet. Run the Evidence Curator agent to gather candidates.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Category</th>
            <th className="px-4 py-2.5 font-medium">Item</th>
            <th className="px-4 py-2.5 font-medium">Source</th>
            <th className="px-4 py-2.5 font-medium">Strength</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-muted/20">
              <td className="px-4 py-3">
                <Badge variant="outline">{formatCategory(row.category)}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-slate-800">{row.title}</div>
                {row.description && (
                  <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {row.description}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                {row.sourceUrl ? (
                  <a
                    href={row.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-indigo-600 hover:underline"
                  >
                    <span className="max-w-[180px] truncate">
                      {new URL(row.sourceUrl).hostname}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 font-mono text-amber-500">
                {strengthStars(row.strength)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={
                      row.status === 'accepted' || decide.isPending
                    }
                    onClick={() =>
                      decide.mutate({ evidenceId: row.id, decision: 'accepted' })
                    }
                  >
                    {decide.isPending && decide.variables?.evidenceId === row.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-destructive"
                    disabled={
                      row.status === 'rejected' || decide.isPending
                    }
                    onClick={() =>
                      decide.mutate({ evidenceId: row.id, decision: 'rejected' })
                    }
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
