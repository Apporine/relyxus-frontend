import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { RegulatorReportPage } from '@/features/compliance/regulator-report-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

type RegulatorReportRouteProps = {
  params: Promise<{ reportId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const translateReport = await getTranslations('regulatorReport');
  return { title: translateReport('sectionName') };
}

export default async function RegulatorReportRoute({ params }: RegulatorReportRouteProps) {
  const { reportId } = await params;
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <RegulatorReportPage reportId={decodeURIComponent(reportId)} />
    </Suspense>
  );
}
