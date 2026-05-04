import { CaseDetailView } from '@/components/case/case-detail-view';

interface Props {
  params: Promise<{ caseId: string }>;
}

export default async function CaseDetailPage({ params }: Props) {
  const { caseId } = await params;
  return <CaseDetailView caseId={caseId} />;
}
