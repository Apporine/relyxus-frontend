import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { SupportAccessPage } from '@/features/admin/support-access-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('admin.supportAccess');
  return { title: translatePage('title') };
}

export default function SupportAccessRoute() {
  return (
    <Suspense fallback={null}>
      <SupportAccessPage />
    </Suspense>
  );
}
