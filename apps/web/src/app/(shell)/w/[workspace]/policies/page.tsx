import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { PoliciesPage } from '@/features/policies/policies-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('policies');
  return { title: translatePage('title') };
}

export default function PoliciesRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <PoliciesPage />
    </Suspense>
  );
}
