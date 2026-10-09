import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { IncidentSummaryPage } from '@/features/mobile/incident-summary-page';

type IncidentSummaryRouteProps = {
  params: Promise<{ incidentReference: string }>;
};

// The title names the reference only; restricted incident titles never reach metadata.
export async function generateMetadata({ params }: IncidentSummaryRouteProps): Promise<Metadata> {
  const { incidentReference } = await params;
  const translateSummary = await getTranslations('mobileSummary');
  return { title: translateSummary('documentTitle', { reference: incidentReference }) };
}

export default async function IncidentSummaryRoute({ params }: IncidentSummaryRouteProps) {
  const { incidentReference } = await params;
  return <IncidentSummaryPage incidentReference={decodeURIComponent(incidentReference)} />;
}
