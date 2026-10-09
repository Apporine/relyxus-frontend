import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminOverviewPage } from '@/features/admin/admin-overview-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translateOverview = await getTranslations('admin.overview');
  return { title: translateOverview('title') };
}

export default function AdminOverviewRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <AdminOverviewPage />
    </Suspense>
  );
}
