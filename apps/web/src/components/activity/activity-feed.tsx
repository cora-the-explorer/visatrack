import { Activity, Bot, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@visa-track/ui';

interface ActivityItem {
  id: string;
  agent: string;
  description: string;
  status: 'running' | 'awaiting_gate' | 'completed';
  timestamp: string;
}

const SAMPLE: ActivityItem[] = [
  {
    id: 'a1',
    agent: 'evidence_curator',
    description: 'Proposed 4 press items · Pitchfork, FADER, Rolling Stone, NPR',
    status: 'awaiting_gate',
    timestamp: '2 min ago',
  },
  {
    id: 'a2',
    agent: 'expert_letter_drafter',
    description: 'Draft v2 ready for Dr. Mira Chen',
    status: 'completed',
    timestamp: '14 min ago',
  },
  {
    id: 'a3',
    agent: 'petition_drafter',
    description: 'Weaving accepted evidence into Section IV',
    status: 'running',
    timestamp: 'now',
  },
];

const STATUS_META: Record<
  ActivityItem['status'],
  { label: string; variant: 'default' | 'secondary' | 'muted'; icon: typeof Clock }
> = {
  running: { label: 'Running', variant: 'secondary', icon: Activity },
  awaiting_gate: { label: 'Needs review', variant: 'default', icon: Clock },
  completed: { label: 'Completed', variant: 'muted', icon: CheckCircle2 },
};

export function ActivityFeed() {
  return (
    <aside className="flex h-screen w-80 flex-col border-l bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Bot className="h-4 w-4 text-svw-teal" />
        <h2 className="text-sm font-semibold">AI Activity</h2>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {SAMPLE.map((item) => {
          const meta = STATUS_META[item.status];
          const Icon = meta.icon;
          return (
            <div key={item.id} className="rounded-md border bg-background p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {item.agent}
                </span>
                <Badge variant={meta.variant} className="gap-1">
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </Badge>
              </div>
              <p className="text-sm">{item.description}</p>
              <div className="mt-1.5 text-xs text-muted-foreground">{item.timestamp}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
