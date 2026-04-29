import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@spinvisa/ui';

export const metadata = { title: 'Forms' };

export default function FormsPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Forms" />
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            I-129, G-28, and supplementals across cases.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
