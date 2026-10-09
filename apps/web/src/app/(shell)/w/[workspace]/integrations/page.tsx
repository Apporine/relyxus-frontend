import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { IntegrationsPage } from '@/features/integrations/integrations-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('integrations');
  return { title: translatePage('title') };
}

export default function IntegrationsRoute() {
  return (
    <Suspense fallback={null}>
      <IntegrationsPage />
    </Suspense>
  );
}
