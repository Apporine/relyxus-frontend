import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { IncidentListPage } from '@/features/incidents/incident-list-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translateList = await getTranslations('incidents.list');
  return { title: translateList('title') };
}

export default function IncidentListRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <IncidentListPage />
    </Suspense>
  );
}
