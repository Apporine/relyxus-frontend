import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { SecurityPage } from '@/features/admin/security-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('admin.security');
  return { title: translatePage('title') };
}

export default function SecurityRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <SecurityPage />
    </Suspense>
  );
}
