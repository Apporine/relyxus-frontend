import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { RuleLibraryPage } from '@/features/compliance/rule-library-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('ruleLibrary');
  return { title: translatePage('title') };
}

export default function RuleLibraryRoute() {
  return (
    <Suspense fallback={null}>
      <RuleLibraryPage />
    </Suspense>
  );
}
