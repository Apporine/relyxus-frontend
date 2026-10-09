import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { IncidentTimelinePage } from '@/features/incident-activity/incident-timeline-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

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
    <Suspense fallback={<RouteLoadingState />}>
      <IncidentTimelinePage incidentReference={decodeURIComponent(incidentReference)} />
    </Suspense>
  );
}
