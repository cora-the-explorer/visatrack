import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@visa-track/ui';
import { CasesList } from '@/components/case/cases-list';

export const metadata = { title: 'Cases' };

export default function CasesPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Cases" />
      <div className="flex items-center justify-end px-6 pt-6">
        <Link href="/cases/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>
      <div className="p-6">
        <CasesList />
      </div>
    </div>
  );
}
