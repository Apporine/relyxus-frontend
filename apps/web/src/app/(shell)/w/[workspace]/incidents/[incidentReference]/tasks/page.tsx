import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { IncidentTasksPage } from '@/features/incident-activity/incident-tasks-page';

type IncidentTasksRouteProps = {
  params: Promise<{ incidentReference: string }>;
};

export async function generateMetadata({ params }: IncidentTasksRouteProps): Promise<Metadata> {
  const { incidentReference } = await params;
  const translateTasks = await getTranslations('incidentTasks');
  return { title: translateTasks('documentTitle', { reference: incidentReference }) };
}

export default async function IncidentTasksRoute({ params }: IncidentTasksRouteProps) {
  const { incidentReference } = await params;
  return (
    <Suspense fallback={null}>
      <IncidentTasksPage incidentReference={decodeURIComponent(incidentReference)} />
    </Suspense>
  );
}
