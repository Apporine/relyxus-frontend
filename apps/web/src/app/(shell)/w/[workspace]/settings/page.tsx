import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminOverviewPage } from '@/features/admin/admin-overview-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateOverview = await getTranslations('admin.overview');
  return { title: translateOverview('title') };
}

export default function AdminOverviewRoute() {
  return (
    <Suspense fallback={null}>
      <AdminOverviewPage />
    </Suspense>
  );
}
