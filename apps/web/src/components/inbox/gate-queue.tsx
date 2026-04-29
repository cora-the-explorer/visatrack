import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge, Card, CardContent } from '@spinvisa/ui';

interface GateItem {
  id: string;
  caseId: string;
  caseTitle: string;
  agent: string;
  summary: string;
  waitedFor: string;
}

const SAMPLE: GateItem[] = [
  {
    id: 'g1',
    caseId: 'c3',
    caseTitle: 'Saoirse — visual artist',
    agent: 'evidence_curator',
    summary: '4 press items proposed, 2 flagged as needs-review',
    waitedFor: '2 min',
  },
  {
    id: 'g2',
    caseId: 'c5',
    caseTitle: 'Jules Adeola — author/poet',
    agent: 'expert_letter_drafter',
    summary: 'Draft letter for Dr. Mira Chen ready for review',
    waitedFor: '14 min',
  },
  {
    id: 'g3',
    caseId: 'c4',
    caseTitle: 'Volkov Quartet — chamber group',
    agent: 'qa_reviewer',
    summary: 'Citation discrepancies found in Section IV',
    waitedFor: '38 min',
  },
];

export function GateQueue() {
  return (
    <div className="space-y-2 p-6">
      {SAMPLE.map((item) => (
        <Card key={item.id}>
          <Link href={`/cases/${item.caseId}`}>
            <CardContent className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge>Needs review</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.agent}
                  </span>
                  <span className="text-xs text-muted-foreground">· {item.waitedFor}</span>
                </div>
                <div className="font-medium">{item.caseTitle}</div>
                <div className="text-sm text-muted-foreground">{item.summary}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
