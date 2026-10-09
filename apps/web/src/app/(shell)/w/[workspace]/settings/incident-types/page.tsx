import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { IncidentTypesPage } from '@/features/incident-types/incident-types-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('incidentTypes');
  return { title: translatePage('title') };
}

export default function IncidentTypesRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <IncidentTypesPage />
    </Suspense>
  );
}
