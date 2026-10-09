import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { UsersPage } from '@/features/admin/users-page';
import { RouteLoadingState } from '@/lib/ui/route-loading-state';

export async function generateMetadata(): Promise<Metadata> {
  const translatePage = await getTranslations('admin.users');
  return { title: translatePage('title') };
}

export default function UsersRoute() {
  return (
    <Suspense fallback={<RouteLoadingState />}>
      <UsersPage />
    </Suspense>
  );
}
