import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { UsersPage } from '@/features/admin/users-page';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('admin.users');
  return { title: translatePage('title') };
}

export default function UsersRoute() {
  return (
    <Suspense fallback={null}>
      <UsersPage />
    </Suspense>
  );
}
