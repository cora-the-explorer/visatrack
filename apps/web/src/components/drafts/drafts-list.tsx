'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Badge, Button, Card, CardContent } from '@visa-track/ui';
import { trpc } from '@/lib/trpc';

function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DraftsList() {
  const { data, isLoading } = trpc.documents.listByKind.useQuery({ kind: 'petition_letter' });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading drafts…</div>;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <FileText className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">No petition drafts yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Drafts produced by the petition_drafter agent will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="font-medium text-slate-800">{doc.title}</span>
                {doc.isCurrent && <Badge variant="success">current</Badge>}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                v{doc.version} · {doc.kind} · created {fmtDate(doc.createdAt)}
              </div>
            </div>
            <Link href={doc.caseId ? `/cases/${doc.caseId}` : '#'}>
              <Button size="sm" variant="outline">
                View Draft
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
