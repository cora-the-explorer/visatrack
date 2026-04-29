import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@spinvisa/ui';

export const metadata = { title: 'Drafts' };

export default function DraftsPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Drafts" />
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Petition letters and expert opinion drafts in progress across all cases.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
