import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { BusinessServicesPage } from '@/features/services/business-services-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateBusinessServices = await getTranslations('businessServices');
  return { title: translateBusinessServices('title') };
}

export default function BusinessServicesRoute() {
  return (
    <Suspense fallback={null}>
      <BusinessServicesPage />
    </Suspense>
  );
}
