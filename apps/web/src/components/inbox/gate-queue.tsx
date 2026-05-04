'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Badge, useToast } from '@spinvisa/ui';
import { trpc } from '@/lib/trpc';

const AGENT_LABEL: Record<string, string> = {
  intake: 'Intake',
  evidence_curator: 'Evidence Curator',
  expert_letter_drafter: 'Expert Letter Drafter',
  petition_drafter: 'Petition Drafter',
  rfe_responder: 'RFE Responder',
  qa_reviewer: 'QA Reviewer',
};

function formatTimeAgo(d: Date | string | null | undefined): string {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function GateQueue() {
  const utils = trpc.useUtils();
  const toast = useToast();
  const { data, isLoading } = trpc.agents.listGateQueue.useQuery();
  const decide = trpc.agents.gateDecision.useMutation({
    onSuccess: (_d, vars) => {
      toast.show({
        variant: 'success',
        title: `Action recorded: ${vars.action}`,
      });
      utils.agents.listGateQueue.invalidate();
      setActiveId(null);
    },
    onError: (err) =>
      toast.show({ variant: 'error', title: 'Failed', description: err.message }),
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeId && data && data.length > 0) {
      setActiveId(data[0]?.id ?? null);
    }
  }, [data, activeId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading queue…
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-slate-800">Inbox is clear</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            No agent runs are currently waiting on a human gate decision. New items will appear
            here as agents complete drafts that require attorney approval.
          </p>
        </div>
      </div>
    );
  }

  const active = data.find((r) => r.id === activeId) ?? data[0];
  if (!active) return null;

  const output = (active.output ?? {}) as Record<string, unknown>;
  const draftText =
    (output.draft as string) ??
    (output.summary as string) ??
    (output.text as string) ??
    JSON.stringify(output, null, 2);

  return (
    <div className="flex-1 overflow-hidden p-6">
      <div className="flex h-[calc(100vh-150px)] overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="w-[350px] overflow-y-auto border-r border-slate-200 bg-slate-50">
          {data.map((row) => {
            const isActive = row.id === active.id;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setActiveId(row.id)}
                className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition ${
                  isActive ? 'bg-white' : 'hover:bg-white/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800">
                    {row.caseTitle ?? 'Unassigned case'}
                  </div>
                  <Badge variant="ai">{AGENT_LABEL[row.agent] ?? row.agent}</Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Awaiting decision · {formatTimeAgo(row.createdAt)}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-start justify-between border-b border-slate-200 p-6">
            <div>
              <h2 className="mb-1 text-[1.1rem] font-semibold text-slate-800">
                {AGENT_LABEL[active.agent] ?? active.agent} ·{' '}
                {active.caseTitle ?? 'Case unknown'}
              </h2>
              <p className="text-sm text-slate-500">
                Submitted {formatTimeAgo(active.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={decide.isPending}
                onClick={() => decide.mutate({ agentRunId: active.id, action: 'approve' })}
                className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={decide.isPending}
                onClick={() => decide.mutate({ agentRunId: active.id, action: 'escalate' })}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Escalate
              </button>
              <button
                type="button"
                disabled={decide.isPending}
                onClick={() => decide.mutate({ agentRunId: active.id, action: 'reject' })}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-white p-8 font-mono text-sm leading-relaxed text-slate-700">
            <div className="mb-3">
              <Badge variant="ai">AI Output</Badge>
            </div>
            <pre className="whitespace-pre-wrap">{draftText}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
