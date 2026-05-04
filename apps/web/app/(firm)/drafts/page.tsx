import { Topbar } from '@/components/layout/topbar';
import { DraftsList } from '@/components/drafts/drafts-list';

export const metadata = { title: 'Drafts' };

export default function DraftsPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Petition Drafts" />
      <div className="p-6">
        <DraftsList />
      </div>
    </div>
  );
}
