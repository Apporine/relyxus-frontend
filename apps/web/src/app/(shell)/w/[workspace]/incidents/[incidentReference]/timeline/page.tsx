import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { IncidentTimelinePage } from '@/features/incident-activity/incident-timeline-page';

type IncidentTimelineRouteProps = {
  params: Promise<{ incidentReference: string }>;
};

export async function generateMetadata({ params }: IncidentTimelineRouteProps): Promise<Metadata> {
  const { incidentReference } = await params;
  const translateTimeline = await getTranslations('incidentTimeline');
  return { title: translateTimeline('documentTitle', { reference: incidentReference }) };
}

export default async function IncidentTimelineRoute({ params }: IncidentTimelineRouteProps) {
  const { incidentReference } = await params;
  return (
    <Suspense fallback={null}>
      <IncidentTimelinePage incidentReference={decodeURIComponent(incidentReference)} />
    </Suspense>
  );
}
