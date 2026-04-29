import { Topbar } from '@/components/layout/topbar';
import { GateQueue } from '@/components/inbox/gate-queue';

export const metadata = { title: 'Inbox' };

export default function InboxPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Attorney inbox" />
      <GateQueue />
    </div>
  );
}
