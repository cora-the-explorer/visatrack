import { Card, CardContent } from '@spinvisa/ui';

export default function CaseTimelinePage() {
  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Case events: agent runs, gate decisions, document versions, attorney notes.
        </CardContent>
      </Card>
    </div>
  );
}
