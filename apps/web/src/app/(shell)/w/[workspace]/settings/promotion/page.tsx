import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { PromotionPage } from '@/features/admin/promotion-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('admin.promotion');
  return { title: translatePage('title') };
}

export default function PromotionRoute() {
  return (
    <Suspense fallback={null}>
      <PromotionPage />
    </Suspense>
  );
}
