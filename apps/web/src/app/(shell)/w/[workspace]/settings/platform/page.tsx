import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { PlatformOperationsPage } from '@/features/admin/platform-operations-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('admin.platform');
  return { title: translatePage('title') };
}

export default function PlatformOperationsRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <PlatformOperationsPage />
    </Suspense>
  );
}
