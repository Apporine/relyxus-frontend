import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ServicesPage } from '@/features/services/services-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateServices = await getTranslations('services');
  return { title: translateServices('title') };
}

export default function ServicesRoute() {
  return (
    <Suspense fallback={null}>
      <ServicesPage />
    </Suspense>
  );
}
