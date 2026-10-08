import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { OnCallPage } from '@/features/on-call/on-call-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateOnCall = await getTranslations('onCall');
  return { title: translateOnCall('title') };
}

export default function OnCallRoute() {
  return (
    <Suspense fallback={null}>
      <OnCallPage />
    </Suspense>
  );
}
