import { Check, X } from 'lucide-react';
import { Badge, Button } from '@spinvisa/ui';

interface EvidenceRow {
  id: string;
  category: string;
  title: string;
  source: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'needs_review';
  strength: number;
}

const SAMPLE: EvidenceRow[] = [
  {
    id: 'e1',
    category: 'Press',
    title: 'Pitchfork — "How NOVA bent club music"',
    source: 'pitchfork.com',
    status: 'proposed',
    strength: 4,
  },
  {
    id: 'e2',
    category: 'Press',
    title: 'NPR All Songs Considered feature',
    source: 'npr.org',
    status: 'accepted',
    strength: 5,
  },
  {
    id: 'e3',
    category: 'Awards',
    title: 'Beatport Top 10 — Electronic 2024',
    source: 'beatport.com',
    status: 'needs_review',
    strength: 3,
  },
];

const STATUS_VARIANT: Record<EvidenceRow['status'], 'default' | 'secondary' | 'muted' | 'destructive'> = {
  proposed: 'secondary',
  accepted: 'default',
  needs_review: 'muted',
  rejected: 'destructive',
};

export function EvidenceTable() {
  return (
    <div className="overflow-x-auto rounded-lg border">
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
          {SAMPLE.map((row) => (
            <tr key={row.id} className="hover:bg-muted/20">
              <td className="px-4 py-3">{row.category}</td>
              <td className="px-4 py-3 font-medium">{row.title}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {row.source}
              </td>
              <td className="px-4 py-3">{'★'.repeat(row.strength)}</td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Check className="h-3.5 w-3.5" /> Accept
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1 text-destructive">
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
