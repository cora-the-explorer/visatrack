'use client';

import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@visa-track/ui';
import { CheckCircle2, FileText, TrendingUp, XCircle } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  intake: 'Intake',
  evidence: 'Evidence',
  drafting: 'Drafting',
  review: 'Review',
  filed: 'Filed',
  approved: 'Approved',
  denied: 'Denied',
  rfe: 'RFE',
  withdrawn: 'Withdrawn',
};

export function ReportsView() {
  const { data, isLoading } = trpc.cases.stats.useQuery();

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Loading reports…</div>;
  }
  if (!data) return null;

  const maxStatusCount = Math.max(1, ...Object.values(data.byStatus));
  const maxVisaCount = Math.max(1, ...Object.values(data.byVisa));

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-2">
      <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-4">
        <StatCard
          label="Total Cases"
          value={data.total}
          icon={<FileText className="h-5 w-5 text-indigo-500" />}
        />
        <StatCard
          label="Approved"
          value={data.approved}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          label="Denied"
          value={data.denied}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          label="Approval Rate"
          value={data.approvalRate === null ? '—' : `${data.approvalRate}%`}
          icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Cases by Status</h3>
          {Object.keys(data.byStatus).length === 0 ? (
            <p className="text-sm text-slate-500">No data yet.</p>
          ) : (
            <ul className="space-y-3">
              {Object.entries(data.byStatus).map(([status, count]) => (
                <li key={status}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700">
                      {STATUS_LABEL[status] ?? status}
                    </span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Cases by Visa Type</h3>
          {Object.keys(data.byVisa).length === 0 ? (
            <p className="text-sm text-slate-500">No data yet.</p>
          ) : (
            <ul className="space-y-3">
              {Object.entries(data.byVisa).map(([visa, count]) => (
                <li key={visa}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{visa}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${(count / maxVisaCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
          <div className="mt-1 text-2xl font-extrabold text-slate-800">{value}</div>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">{icon}</div>
      </CardContent>
    </Card>
  );
}
