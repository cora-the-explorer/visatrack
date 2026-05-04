import { Topbar } from '@/components/layout/topbar';
import { ReportsView } from '@/components/reports/reports-view';

export const metadata = { title: 'Reports' };

export default function ReportsPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Reports" />
      <ReportsView />
    </div>
  );
}
