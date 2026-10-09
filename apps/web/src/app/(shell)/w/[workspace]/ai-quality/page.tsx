import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AiQualityPage } from '@/features/ai-quality/ai-quality-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateAiQuality = await getTranslations('aiQuality');
  return { title: translateAiQuality('title') };
}

export default function AiQualityRoute() {
  return (
    <Suspense fallback={null}>
      <AiQualityPage />
    </Suspense>
  );
}
