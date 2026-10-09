import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { EvidenceExplorerPage } from '@/features/evidence/evidence-explorer-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

type EvidenceExplorerRouteProps = {
  params: Promise<{ incidentReference: string }>;
};

export async function generateMetadata({ params }: EvidenceExplorerRouteProps): Promise<Metadata> {
  const { incidentReference } = await params;
  const translateExplorer = await getTranslations('evidenceExplorer');
  return { title: translateExplorer('documentTitle', { reference: incidentReference }) };
}

export default async function EvidenceExplorerRoute({ params }: EvidenceExplorerRouteProps) {
  const { incidentReference } = await params;
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <EvidenceExplorerPage incidentReference={decodeURIComponent(incidentReference)} />
    </Suspense>
  );
}
