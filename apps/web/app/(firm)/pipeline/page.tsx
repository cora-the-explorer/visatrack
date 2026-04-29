import { Topbar } from '@/components/layout/topbar';
import { PipelineBoard } from '@/components/pipeline/pipeline-board';

export const metadata = { title: 'Pipeline' };

export default function PipelinePage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="Pipeline" />
      <PipelineBoard />
    </div>
  );
}
