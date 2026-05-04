'use client';

import Link from 'next/link';
import { Badge, Card, CardContent } from '@spinvisa/ui';
import { trpc } from '@/lib/trpc';

export function CasesList() {
  const { data, isLoading } = trpc.cases.list.useQuery();

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Loading cases…</div>;
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No cases yet. <Link href="/cases/new" className="text-indigo-600 hover:underline">Create the first one.</Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((c) => (
        <Card key={c.id}>
          <Link href={`/cases/${c.id}`}>
            <CardContent className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40">
              <div>
                <div className="font-medium">{c.artistName ?? c.title}</div>
                <div className="text-xs text-muted-foreground">
                  {c.title} · Case #{c.id.slice(0, 8)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{c.visaType}</Badge>
                <Badge variant="secondary" className="capitalize">
                  {c.status}
                </Badge>
              </div>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
