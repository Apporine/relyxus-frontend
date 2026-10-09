import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ComplianceCentrePage } from '@/features/compliance/compliance-centre-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('compliance');
  return { title: translatePage('title') };
}

export default function ComplianceCentreRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <ComplianceCentrePage />
    </Suspense>
  );
}
