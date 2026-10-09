import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { PromotionPage } from '@/features/admin/promotion-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('admin.promotion');
  return { title: translatePage('title') };
}

export default function PromotionRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <PromotionPage />
    </Suspense>
  );
}
