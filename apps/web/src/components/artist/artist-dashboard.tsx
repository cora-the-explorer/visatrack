'use client';

import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn } from '@visa-track/ui';

const STAGES = [
  { key: 'intake', label: 'Intake', plain: 'We collect your basic info.' },
  { key: 'evidence', label: 'Evidence Gathering', plain: 'Our AI gathers proof of your achievements.' },
  { key: 'drafting', label: 'Petition Drafted', plain: 'Your attorney prepares the petition letter.' },
  { key: 'review', label: 'Attorney Review', plain: 'A licensed attorney reviews everything.' },
  { key: 'filed', label: 'Filed with USCIS', plain: 'Your case is officially submitted.' },
  { key: 'approved', label: 'Approved', plain: 'You are approved!' },
] as const;

type StageKey = (typeof STAGES)[number]['key'];

const STATUS_TO_STEP: Record<string, number> = {
  intake: 0,
  evidence: 1,
  drafting: 2,
  review: 3,
  filed: 4,
  rfe: 4,
  approved: 5,
  denied: 5,
  withdrawn: 5,
};

export function ArtistDashboard() {
  const { data, isLoading } = trpc.cases.list.useQuery();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-slate-500 md:px-8 md:py-16">Loading your case…</div>
    );
  }

  const myCase = data?.[0];

  if (!myCase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-16">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center md:p-12">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome to your portal
          </h1>
          <p className="mt-2 text-base text-slate-600">
            Your case hasn't been set up yet. Your attorney will reach out shortly to begin
            intake.
          </p>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_TO_STEP[myCase.status] ?? 0;
  const subject = myCase.artistName ?? myCase.title;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-12">
      <div className="mb-8 md:mb-10">
        <p className="text-sm font-medium uppercase tracking-wider text-indigo-600">
          {myCase.visaType} Petition
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Hello, {subject.split(' ')[0]}
        </h1>
        <p className="mt-2 max-w-xl text-base text-slate-600 md:mt-3 md:text-lg">
          Here's where your case stands today. We'll let you know whenever there's something
          new for you to review or do.
        </p>
      </div>

      <section className="mb-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:mb-10 md:p-8">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Current Step
        </div>
        <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
          {STAGES[currentStep]?.label ?? 'In Progress'}
        </h2>
        <p className="mt-2 text-base text-slate-600">{STAGES[currentStep]?.plain}</p>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Step {currentStep + 1} of {STAGES.length}</span>
            <span>{Math.round(((currentStep + 1) / STAGES.length) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
              style={{ width: `${((currentStep + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        </div>
      </section>

      <section className="mb-8 md:mb-10">
        <h2 className="mb-4 text-base font-semibold text-slate-700 md:mb-5">Your Journey</h2>
        <ol className="space-y-3">
          {STAGES.map((s, i) => (
            <StageRow
              key={s.key}
              stage={s}
              status={i < currentStep ? 'done' : i === currentStep ? 'active' : 'upcoming'}
            />
          ))}
        </ol>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/portal/documents"
          className="group rounded-xl border border-slate-100 bg-white p-6 transition hover:border-indigo-200 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-slate-900">Upload Documents</h3>
          <p className="mt-1 text-sm text-slate-600">
            Send your attorney passports, contracts, awards, and other evidence.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        <Link
          href="/portal/messages"
          className="group rounded-xl border border-slate-100 bg-white p-6 transition hover:border-indigo-200 hover:shadow-md"
        >
          <h3 className="text-lg font-semibold text-slate-900">Message Your Attorney</h3>
          <p className="mt-1 text-sm text-slate-600">
            Ask questions, share updates, or request a call.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all">
            Open <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>
    </div>
  );
}

function StageRow({
  stage,
  status,
}: {
  stage: { key: StageKey; label: string; plain: string };
  status: 'done' | 'active' | 'upcoming';
}) {
  return (
    <li
      className={cn(
        'flex items-start gap-4 rounded-xl border p-5 transition',
        status === 'active' && 'border-indigo-200 bg-indigo-50/40 ring-1 ring-indigo-100',
        status === 'done' && 'border-slate-100 bg-white',
        status === 'upcoming' && 'border-slate-100 bg-white opacity-60',
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
          status === 'done' && 'bg-green-500 text-white',
          status === 'active' && 'bg-indigo-500 text-white',
          status === 'upcoming' && 'border-2 border-slate-200 bg-white text-slate-400',
        )}
      >
        {status === 'done' ? <Check className="h-4 w-4" /> : '•'}
      </div>
      <div className="flex-1">
        <div className="text-base font-semibold text-slate-900">{stage.label}</div>
        <div className="mt-0.5 text-sm text-slate-600">{stage.plain}</div>
      </div>
    </li>
  );
}
