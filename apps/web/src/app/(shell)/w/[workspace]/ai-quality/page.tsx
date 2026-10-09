import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AiQualityPage } from '@/features/ai-quality/ai-quality-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translateAiQuality = await getTranslations('aiQuality');
  return { title: translateAiQuality('title') };
}

export default function AiQualityRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <AiQualityPage />
    </Suspense>
  );
}
