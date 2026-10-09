import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ApprovalsInboxPage } from '@/features/approvals/approvals-inbox-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translateInbox = await getTranslations('approvals.inbox');
  return { title: translateInbox('title') };
}

export default function ApprovalsInboxRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <ApprovalsInboxPage />
    </Suspense>
  );
}
