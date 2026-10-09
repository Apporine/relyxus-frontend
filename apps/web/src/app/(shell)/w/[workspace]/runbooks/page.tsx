import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { RunbooksPage } from '@/features/runbooks/runbooks-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('runbooks');
  return { title: translatePage('title') };
}

export default function RunbooksRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <RunbooksPage />
    </Suspense>
  );
}
