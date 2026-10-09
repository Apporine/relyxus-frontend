import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { RuleLibraryPage } from '@/features/compliance/rule-library-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('ruleLibrary');
  return { title: translatePage('title') };
}

export default function RuleLibraryRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <RuleLibraryPage />
    </Suspense>
  );
}
