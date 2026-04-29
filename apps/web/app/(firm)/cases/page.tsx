import Link from 'next/link';
import { Topbar } from '@/components/layout/topbar';
import { Badge, Card, CardContent } from '@spinvisa/ui';

export const metadata = { title: 'Cases' };

const SAMPLE = [
  { id: 'c1', title: 'NOVA — electronic music producer', visa: 'O-1B', status: 'Intake' },
  { id: 'c2', title: 'Lior Cohen — concert pianist', visa: 'O-1B', status: 'Intake' },
  { id: 'c3', title: 'Saoirse — visual artist', visa: 'O-1B', status: 'Evidence' },
  { id: 'c4', title: 'Volkov Quartet — chamber group', visa: 'P-1B', status: 'Evidence' },
  { id: 'c5', title: 'Jules Adeola — author/poet', visa: 'O-1B', status: 'Drafting' },
];

export default function CasesPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Cases" />
      <div className="space-y-2 p-6">
        {SAMPLE.map((c) => (
          <Card key={c.id}>
            <Link href={`/cases/${c.id}`}>
              <CardContent className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground">Case ID: {c.id}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{c.visa}</Badge>
                  <Badge variant="secondary">{c.status}</Badge>
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
