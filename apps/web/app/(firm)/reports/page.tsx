import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@spinvisa/ui';

export const metadata = { title: 'Reports' };

export default function ReportsPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Reports" />
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Approval rates, RFE rates, time-to-file, agent token spend.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
