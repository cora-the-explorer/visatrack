'use client';

import { CheckCircle2, Circle, FileText, Sparkles, Upload } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface TimelineEntry {
  id: string;
  date: Date | string;
  icon: typeof CheckCircle2;
  title: string;
  description: string;
  variant: 'done' | 'info' | 'pending';
}

function fmt(d: Date | string | null | undefined): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ArtistTimeline() {
  const { data: cases, isLoading } = trpc.cases.list.useQuery();
  const summary = cases?.[0];
  const { data: myCase } = trpc.cases.byId.useQuery(summary?.id ?? '', {
    enabled: !!summary,
  });
  const { data: documents } = trpc.documents.listByCase.useQuery(myCase?.id ?? '', {
    enabled: !!myCase,
  });

  if (isLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-slate-500 md:px-8 md:py-16">Loading…</div>;
  }

  if (!myCase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-slate-500 md:px-8 md:py-16">
        Your timeline will appear here once your case is created.
      </div>
    );
  }

  const entries: TimelineEntry[] = [];

  entries.push({
    id: 'created',
    date: myCase.createdAt,
    icon: CheckCircle2,
    title: 'Case created',
    description: `Your ${myCase.visaType} petition was opened.`,
    variant: 'done',
  });

  if (documents && documents.length > 0) {
    entries.push({
      id: 'docs',
      date: documents[0]?.createdAt ?? new Date(),
      icon: Upload,
      title: `${documents.length} document${documents.length === 1 ? '' : 's'} received`,
      description: 'Your attorney is reviewing what you sent.',
      variant: 'done',
    });
  }

  if (myCase.status === 'evidence' || myCase.status === 'drafting' || myCase.status === 'review') {
    entries.push({
      id: 'evidence',
      date: new Date(),
      icon: Sparkles,
      title: 'Evidence gathering in progress',
      description: 'Our AI is searching for press, awards, and other proof of your work.',
      variant: 'info',
    });
  }

  if (myCase.status === 'drafting' || myCase.status === 'review') {
    entries.push({
      id: 'draft',
      date: new Date(),
      icon: FileText,
      title: 'Petition letter being drafted',
      description: 'Your attorney is finalizing the legal arguments.',
      variant: 'info',
    });
  }

  if (myCase.filedAt) {
    entries.push({
      id: 'filed',
      date: myCase.filedAt,
      icon: CheckCircle2,
      title: 'Filed with USCIS',
      description: 'Your petition is now officially submitted.',
      variant: 'done',
    });
  } else {
    entries.push({
      id: 'filed-pending',
      date: 'Upcoming',
      icon: Circle,
      title: 'Filing with USCIS',
      description: 'We will notify you when your petition is filed.',
      variant: 'pending',
    });
  }

  if (myCase.decidedAt) {
    entries.push({
      id: 'decision',
      date: myCase.decidedAt,
      icon: CheckCircle2,
      title: myCase.status === 'approved' ? 'Approved by USCIS' : 'USCIS Decision',
      description:
        myCase.status === 'approved'
          ? 'Congratulations — your petition was approved.'
          : 'See your attorney for next steps.',
      variant: myCase.status === 'approved' ? 'done' : 'info',
    });
  } else {
    entries.push({
      id: 'decision-pending',
      date: 'Upcoming',
      icon: Circle,
      title: 'USCIS Decision',
      description: 'Decisions typically take 2-3 months from filing.',
      variant: 'pending',
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-12">
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">Timeline</h1>
        <p className="mt-2 text-base text-slate-600">
          Everything that's happened on your case, from intake to decision.
        </p>
      </div>

      <ol className="space-y-6">
        {entries.map((entry, i) => {
          const Icon = entry.icon;
          const isLast = i === entries.length - 1;
          return (
            <li key={entry.id} className="relative pl-12">
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[19px] top-10 bottom-[-24px] w-px bg-slate-200"
                />
              )}
              <div
                className={`absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full ${
                  entry.variant === 'done'
                    ? 'bg-green-500 text-white'
                    : entry.variant === 'info'
                      ? 'bg-indigo-500 text-white'
                      : 'border-2 border-slate-200 bg-white text-slate-400'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {typeof entry.date === 'string' ? entry.date : fmt(entry.date)}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{entry.title}</h3>
                <p className="mt-1 text-base text-slate-600">{entry.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
