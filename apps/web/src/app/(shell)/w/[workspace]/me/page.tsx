import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { PersonalSettingsPage } from '@/features/personal-settings/personal-settings-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translateSettings = await getTranslations('personalSettings');
  return { title: translateSettings('title') };
}

export default function PersonalSettingsRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <PersonalSettingsPage />
    </Suspense>
  );
}
