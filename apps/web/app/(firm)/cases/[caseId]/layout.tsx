import type { ReactNode } from 'react';
import { Topbar } from '@/components/layout/topbar';
import { CaseTabs } from '@/components/case/case-tabs';
import { Badge } from '@spinvisa/ui';

interface Props {
  children: ReactNode;
  params: Promise<{ caseId: string }>;
}

export default async function CaseDetailLayout({ children, params }: Props) {
  const { caseId } = await params;
  return (
    <div className="flex h-full flex-col">
      <Topbar title={`Case ${caseId}`} />
      <div className="flex items-center gap-3 px-6 py-4">
        <h2 className="text-xl font-semibold">NOVA — electronic music producer</h2>
        <Badge variant="outline">O-1B</Badge>
        <Badge variant="secondary">Evidence</Badge>
      </div>
      <CaseTabs caseId={caseId} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
