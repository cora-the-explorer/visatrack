import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@spinvisa/ui';

export const metadata = { title: 'Calendar' };

export default function CalendarPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Calendar" />
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Filing deadlines, client check-ins, and biometric appointments.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
