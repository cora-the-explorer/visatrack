import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@spinvisa/ui';

export const metadata = { title: 'Lawyers' };

export default function LawyersPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Lawyers" />
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Attorney workloads, sign-off authority, and capacity planning.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
