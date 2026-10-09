import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { AuditLogPage } from '@/features/audit/audit-log-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('audit');
  return { title: translatePage('title') };
}

export default function AuditLogRoute() {
  return (
    <Suspense fallback={null}>
      <AuditLogPage />
    </Suspense>
  );
}
