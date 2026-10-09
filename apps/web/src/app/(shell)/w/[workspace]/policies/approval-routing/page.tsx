import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ApprovalRoutingPage } from '@/features/policies/approval-routing-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('approvalRouting');
  return { title: translatePage('title') };
}

export default function ApprovalRoutingRoute() {
  return (
    <Suspense fallback={null}>
      <ApprovalRoutingPage />
    </Suspense>
  );
}
