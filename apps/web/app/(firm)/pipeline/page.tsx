import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { PipelineBoard } from '@/components/pipeline/pipeline-board';
import { Button } from '@visa-track/ui';

export const metadata = { title: 'Pipeline' };

export default function PipelinePage() {
  return (
    <>
      <Topbar
        title="Case Pipeline"
        actions={
          <Link href="/cases/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Case
            </Button>
          </Link>
        }
      />
      <PipelineBoard />
    </>
  );
}
