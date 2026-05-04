import { EvidenceTable } from '@/components/evidence/evidence-table';

interface Props {
  params: Promise<{ caseId: string }>;
}

export default async function CaseEvidencePage({ params }: Props) {
  const { caseId } = await params;
  return (
    <div className="p-6">
      <EvidenceTable caseId={caseId} />
    </div>
  );
}
