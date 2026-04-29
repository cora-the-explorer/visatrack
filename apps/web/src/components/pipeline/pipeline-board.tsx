import { Badge, Card, CardContent } from '@spinvisa/ui';

const COLUMNS = [
  { id: 'intake', label: 'Intake', accent: 'bg-svw-teal/20 text-svw-teal' },
  { id: 'evidence', label: 'Evidence', accent: 'bg-svw-pink/20 text-svw-pink' },
  { id: 'drafting', label: 'Drafting', accent: 'bg-amber-500/20 text-amber-400' },
  { id: 'review', label: 'Attorney Review', accent: 'bg-violet-500/20 text-violet-400' },
  { id: 'filed', label: 'Filed', accent: 'bg-emerald-500/20 text-emerald-400' },
] as const;

const SAMPLE_CARDS: Record<(typeof COLUMNS)[number]['id'], { id: string; title: string; visa: string; due: string }[]> = {
  intake: [
    { id: 'c1', title: 'NOVA — electronic music producer', visa: 'O-1B', due: 'May 12' },
    { id: 'c2', title: 'Lior Cohen — concert pianist', visa: 'O-1B', due: 'May 18' },
  ],
  evidence: [
    { id: 'c3', title: 'Saoirse — visual artist', visa: 'O-1B', due: 'May 5' },
    { id: 'c4', title: 'Volkov Quartet — chamber group', visa: 'P-1B', due: 'May 9' },
  ],
  drafting: [
    { id: 'c5', title: 'Jules Adeola — author/poet', visa: 'O-1B', due: 'May 2' },
  ],
  review: [
    { id: 'c6', title: 'Maya Sato — choreographer', visa: 'O-1B', due: 'Apr 30' },
  ],
  filed: [
    { id: 'c7', title: 'Ibrahim Ndiaye — DJ', visa: 'O-1B', due: 'Filed Apr 22' },
  ],
};

export function PipelineBoard() {
  return (
    <div className="grid h-full grid-cols-5 gap-4 overflow-x-auto p-6">
      {COLUMNS.map((column) => {
        const cards = SAMPLE_CARDS[column.id];
        return (
          <div key={column.id} className="flex min-w-[220px] flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${column.accent}`}>
                  {column.label}
                </span>
                <span className="text-xs text-muted-foreground">{cards.length}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto rounded-lg bg-muted/40 p-2">
              {cards.map((card) => (
                <Card key={card.id} className="cursor-pointer transition-colors hover:border-primary/40">
                  <CardContent className="space-y-2 p-3">
                    <div className="text-sm font-medium leading-snug">{card.title}</div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{card.visa}</Badge>
                      <span className="text-xs text-muted-foreground">{card.due}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
