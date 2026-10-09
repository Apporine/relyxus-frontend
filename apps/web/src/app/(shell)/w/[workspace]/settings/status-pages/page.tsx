import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { StatusPagesPage } from '@/features/admin/status-pages-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('admin.statusPages');
  return { title: translatePage('title') };
}

export default function StatusPagesRoute() {
  return (
    <Suspense fallback={null}>
      <StatusPagesPage />
    </Suspense>
  );
}
