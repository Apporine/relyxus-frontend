import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { ReplayRunPage } from '@/features/ai-quality/replay-run-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

type ReplayRunRouteProps = {
  params: Promise<{ runId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const translateRun = await getTranslations('aiQuality.run');
  return { title: translateRun('sectionName') };
}

export default async function ReplayRunRoute({ params }: ReplayRunRouteProps) {
  const { runId } = await params;
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <ReplayRunPage runId={decodeURIComponent(runId)} />
    </Suspense>
  );
}
