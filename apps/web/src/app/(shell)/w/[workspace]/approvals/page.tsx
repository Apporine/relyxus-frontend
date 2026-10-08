import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ApprovalsInboxPage } from '@/features/approvals/approvals-inbox-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateInbox = await getTranslations('approvals.inbox');
  return { title: translateInbox('title') };
}

export default function ApprovalsInboxRoute() {
  return (
    <Suspense fallback={null}>
      <ApprovalsInboxPage />
    </Suspense>
  );
}
