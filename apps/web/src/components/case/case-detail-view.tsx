'use client';

import { useMemo, useState } from 'react';
import { Check, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { Badge, TimelineItem, cn, useToast, type TimelineStatus } from '@spinvisa/ui';
import { Topbar } from '@/components/layout/topbar';
import { trpc } from '@/lib/trpc';
import type { CaseStatus } from '@spinvisa/api-types';

const TABS = ['Overview', 'Documents', 'Notes', 'Activity'] as const;
type Tab = (typeof TABS)[number];

type StepState = 'completed' | 'active' | 'pending';

const STAGE_ORDER: { key: CaseStatus; label: string }[] = [
  { key: 'intake', label: 'Intake' },
  { key: 'evidence', label: 'Evidence' },
  { key: 'drafting', label: 'Drafting' },
  { key: 'review', label: 'Review' },
  { key: 'filed', label: 'Filed' },
];

function buildStages(status: CaseStatus): { label: string; state: StepState }[] {
  const idx = STAGE_ORDER.findIndex((s) => s.key === status);
  return STAGE_ORDER.map((s, i) => ({
    label: s.label,
    state: idx === -1 ? 'pending' : i < idx ? 'completed' : i === idx ? 'active' : 'pending',
  }));
}

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

type ApproveStatus = 'idle' | 'loading' | 'approved';

export function CaseDetailView({ caseId }: { caseId: string }) {
  const [tab, setTab] = useState<Tab>('Overview');
  const [approve, setApprove] = useState<ApproveStatus>('idle');
  const toast = useToast();

  const { data: caseData, isLoading } = trpc.cases.byId.useQuery(caseId);
  const { data: documents } = trpc.documents.listByCase.useQuery(caseId, {
    enabled: !!caseData,
  });
  const { data: evidence } = trpc.evidence.listByCase.useQuery(caseId, {
    enabled: !!caseData,
  });

  const stages = useMemo(() => buildStages(caseData?.status ?? 'intake'), [caseData?.status]);

  const timeline = useMemo(() => {
    const items: { date: string; title: string; status: TimelineStatus }[] = [];
    if (caseData?.createdAt) {
      items.push({
        date: fmtDate(caseData.createdAt),
        title: 'Case Created',
        status: 'completed',
      });
    }
    if (evidence && evidence.length > 0) {
      items.push({
        date: fmtDate(evidence[0]?.createdAt),
        title: `${evidence.length} evidence items proposed`,
        status: 'completed',
      });
    }
    if (caseData?.filedAt) {
      items.push({
        date: fmtDate(caseData.filedAt),
        title: 'Filed with USCIS',
        status: 'completed',
      });
    }
    if (caseData?.decidedAt) {
      items.push({
        date: fmtDate(caseData.decidedAt),
        title: caseData.status === 'approved' ? 'USCIS Approved' : 'USCIS Decision',
        status: caseData.status === 'denied' ? 'pending' : 'completed',
      });
    }
    return items;
  }, [caseData, evidence]);

  const handleApprove = () => {
    if (approve !== 'idle') return;
    setApprove('loading');
    setTimeout(() => {
      setApprove('approved');
      toast.show({
        variant: 'success',
        title: 'Case approved',
        description: 'USCIS filing package ready for download.',
      });
    }, 900);
  };

  const handleDownload = () => {
    if (typeof window !== 'undefined') {
      window.alert('Filing package would download here');
    }
  };

  if (isLoading) {
    return (
      <>
        <Topbar title="Loading case…" />
        <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
          Loading…
        </div>
      </>
    );
  }

  if (!caseData) {
    return (
      <>
        <Topbar title="Case not found" />
        <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
          We couldn't find that case.
        </div>
      </>
    );
  }

  const subjectName = caseData.artist?.legalName ?? caseData.title;
  const attorneyName = caseData.leadAttorney?.fullName ?? 'Unassigned';

  return (
    <>
      <Topbar title={`Case · ${subjectName}`} />
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto pb-[90px]">
          <div className="flex items-end justify-between border-b border-slate-200 bg-white px-12 py-8">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <Badge variant="visa">{caseData.visaType}</Badge>
                <span className="text-[0.85rem] text-slate-500">
                  Case #{caseId.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-900">
                {subjectName}
              </h1>
              <div className="mt-1 text-sm text-slate-500">{caseData.title}</div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-[0.85rem] font-medium text-slate-700 transition-all duration-150 ease-in-out hover:bg-slate-50"
              >
                Share Access
              </button>
              <button
                type="button"
                className="rounded-md bg-indigo-500 px-4 py-2 text-[0.85rem] font-medium text-white transition-all duration-150 ease-in-out hover:bg-indigo-600"
              >
                Submit to USCIS
              </button>
            </div>
          </div>

          <div className="flex gap-8 border-b border-slate-200 bg-slate-50 px-12 py-8">
            {stages.map((stage, i) => {
              const isLast = i === stages.length - 1;
              const lineCompleted = stage.state === 'completed';
              return (
                <div key={stage.label} className="relative flex flex-1 flex-col gap-2">
                  <div
                    className={cn(
                      'z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white text-[10px] font-bold',
                      stage.state === 'completed' && 'border-indigo-500 bg-indigo-500 text-white',
                      stage.state === 'active' &&
                        'border-indigo-500 text-indigo-500 ring-[3px] ring-indigo-500/15',
                      stage.state === 'pending' && 'border-slate-200 text-slate-500',
                    )}
                  >
                    {stage.state === 'completed' ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {!isLast && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute left-6 top-3 h-0.5',
                        lineCompleted ? 'bg-indigo-500' : 'bg-slate-200',
                      )}
                      style={{ width: 'calc(100% + 2rem - 1.5rem)' }}
                    />
                  )}
                  <div className="text-[0.75rem] font-semibold text-slate-500">
                    {stage.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-8 pt-8">
            {approve === 'approved' && (
              <div className="mb-6 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-green-800">Case approved</div>
                    <div className="text-xs text-green-700">
                      USCIS filing package ready for download.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                >
                  <Download className="h-4 w-4" />
                  Download Filing Package
                </button>
              </div>
            )}
            <div className="grid h-full gap-6 lg:grid-cols-[280px_1fr_300px]">
              <div className="border-r border-slate-200 pr-6">
                <h3 className="mb-6 text-sm font-semibold text-slate-700">Case History</h3>
                {timeline.length === 0 ? (
                  <p className="text-sm text-slate-500">No activity yet.</p>
                ) : (
                  timeline.map((item, i) => (
                    <TimelineItem
                      key={`${item.title}-${i}`}
                      date={item.date}
                      title={item.title}
                      status={item.status}
                      isLast={i === timeline.length - 1}
                    />
                  ))
                )}
              </div>

              <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="flex border-b border-slate-200 bg-slate-50">
                  {TABS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`border-b-2 px-6 py-4 text-sm font-medium transition ${
                        tab === t
                          ? 'border-indigo-500 bg-white text-indigo-500'
                          : 'border-transparent text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {t}
                      {t === 'Documents' && documents
                        ? ` (${documents.length})`
                        : ''}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto p-6 text-[0.9rem] leading-relaxed text-slate-700">
                  {tab === 'Overview' && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-slate-800">{caseData.title}</h2>
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-xs uppercase text-slate-500">Visa</dt>
                          <dd className="font-medium">{caseData.visaType}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-slate-500">Status</dt>
                          <dd className="font-medium capitalize">{caseData.status}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-slate-500">Artist</dt>
                          <dd className="font-medium">{caseData.artist?.legalName ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-slate-500">Sponsor</dt>
                          <dd className="font-medium">{caseData.sponsor?.name ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-slate-500">Lead Attorney</dt>
                          <dd className="font-medium">{attorneyName}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase text-slate-500">Target Filing</dt>
                          <dd className="font-medium">{fmtDate(caseData.targetFilingDate)}</dd>
                        </div>
                        {caseData.receiptNumber && (
                          <div>
                            <dt className="text-xs uppercase text-slate-500">Receipt #</dt>
                            <dd className="font-mono text-xs">{caseData.receiptNumber}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-xs uppercase text-slate-500">Created</dt>
                          <dd className="font-medium">{fmtDate(caseData.createdAt)}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                  {tab === 'Documents' && (
                    <ul className="space-y-2">
                      {!documents || documents.length === 0 ? (
                        <li className="text-sm text-slate-500">No documents uploaded yet.</li>
                      ) : (
                        documents.map((d) => (
                          <li
                            key={d.id}
                            className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3"
                          >
                            <div>
                              <div className="font-medium text-slate-800">{d.title}</div>
                              <div className="text-xs text-slate-500">
                                {d.kind} · v{d.version}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">
                              {fmtDate(d.createdAt)}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                  {tab === 'Notes' && (
                    <p className="text-slate-500">
                      No notes yet for case {caseId.slice(0, 8)}.
                    </p>
                  )}
                  {tab === 'Activity' && (
                    <ul className="space-y-3 text-sm text-slate-700">
                      {timeline.map((item, i) => (
                        <li key={i}>
                          <b>{item.date}</b> — {item.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <section className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="mb-1 text-xs font-semibold uppercase text-slate-500">
                    Client
                  </div>
                  <div className="mb-4 text-sm font-medium text-slate-800">{subjectName}</div>
                  <div className="mb-1 text-xs font-semibold uppercase text-slate-500">
                    Visa Type
                  </div>
                  <div className="mb-4">
                    <Badge variant="visa">{caseData.visaType}</Badge>
                  </div>
                  <div className="mb-1 text-xs font-semibold uppercase text-slate-500">
                    Assigned Attorney
                  </div>
                  <div className="mb-4 text-sm font-medium text-slate-800">{attorneyName}</div>
                  <div className="mb-1 text-xs font-semibold uppercase text-slate-500">
                    Target Filing
                  </div>
                  <div className="text-sm font-medium text-slate-800">
                    {fmtDate(caseData.targetFilingDate)}
                  </div>
                </section>
                <section className="rounded-lg border border-slate-200 border-l-4 border-l-indigo-500 bg-white p-5">
                  <div className="mb-1 text-xs font-semibold uppercase text-slate-500">
                    Evidence
                  </div>
                  <div className="mb-2 text-xl font-extrabold text-indigo-500">
                    {evidence?.length ?? 0} items
                  </div>
                  <p className="text-xs text-slate-500">
                    {evidence?.filter((e) => e.status === 'accepted').length ?? 0} accepted ·{' '}
                    {evidence?.filter((e) => e.status === 'proposed').length ?? 0} pending
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-[220px] right-0 z-10 flex h-[70px] items-center justify-between border-t border-slate-200 bg-white px-8">
          <div className="flex items-center gap-4">
            {approve === 'approved' ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approved
              </span>
            ) : (
              <Badge variant="ai">Status: {caseData.status}</Badge>
            )}
            <span className="text-sm text-slate-500">
              {approve === 'approved'
                ? 'Filing package ready'
                : `Updated ${fmtDate(caseData.updatedAt)}`}
            </span>
          </div>
          <div className="flex gap-3">
            {approve === 'approved' ? (
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-md bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                <Download className="h-4 w-4" />
                Download Filing Package
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={approve === 'loading'}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approve === 'loading'}
                  className="flex items-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 disabled:opacity-70"
                >
                  {approve === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finalizing…
                    </>
                  ) : (
                    'Approve & Finalize'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
