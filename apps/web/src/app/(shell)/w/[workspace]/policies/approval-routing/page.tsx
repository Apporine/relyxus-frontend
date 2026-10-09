import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ApprovalRoutingPage } from '@/features/policies/approval-routing-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('approvalRouting');
  return { title: translatePage('title') };
}

export default function ApprovalRoutingRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <ApprovalRoutingPage />
    </Suspense>
  );
}
