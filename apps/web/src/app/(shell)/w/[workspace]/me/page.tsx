import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { PersonalSettingsPage } from '@/features/personal-settings/personal-settings-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateSettings = await getTranslations('personalSettings');
  return { title: translateSettings('title') };
}

export default function PersonalSettingsRoute() {
  return (
    <Suspense fallback={null}>
      <PersonalSettingsPage />
    </Suspense>
  );
}
