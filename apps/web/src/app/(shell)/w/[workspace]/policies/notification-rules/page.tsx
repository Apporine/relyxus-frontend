import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { NotificationRulesPage } from '@/features/policies/notification-rules-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('notificationRules');
  return { title: translatePage('title') };
}

export default function NotificationRulesRoute() {
  return (
    <Suspense fallback={null}>
      <NotificationRulesPage />
    </Suspense>
  );
}
