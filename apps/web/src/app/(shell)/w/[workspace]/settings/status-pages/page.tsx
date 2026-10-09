import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { StatusPagesPage } from '@/features/admin/status-pages-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('admin.statusPages');
  return { title: translatePage('title') };
}

export default function StatusPagesRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <StatusPagesPage />
    </Suspense>
  );
}
