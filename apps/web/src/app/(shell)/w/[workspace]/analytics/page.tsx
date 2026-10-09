import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AnalyticsPage } from '@/features/analytics/analytics-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('analytics');
  return { title: translatePage('title') };
}

export default function AnalyticsRoute() {
  return (
    <Suspense fallback={null}>
      <AnalyticsPage />
    </Suspense>
  );
}
