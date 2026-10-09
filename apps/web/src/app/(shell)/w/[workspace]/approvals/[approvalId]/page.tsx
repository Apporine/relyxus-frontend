import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { ApprovalPage } from '@/features/approvals/approval-page';

type ApprovalRouteProps = {
  params: Promise<{ approvalId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('approvals.page');
  return { title: translatePage('approvalNeeded') };
}

export default async function ApprovalRoute({ params }: ApprovalRouteProps) {
  const { approvalId } = await params;
  return <ApprovalPage approvalId={decodeURIComponent(approvalId)} />;
}
