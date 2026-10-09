import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AnalyticsPage } from '@/features/analytics/analytics-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('analytics');
  return { title: translatePage('title') };
}

export default function AnalyticsRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <AnalyticsPage />
    </Suspense>
  );
}
