import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { SignInPage } from '@/features/identity/sign-in-page';
import { FullPageBusyState } from '@/shell/states/full-page-busy-state';

export async function generateMetadata(): Promise<Metadata> {
  const translateSignIn = await getTranslations('signIn');
  return { title: translateSignIn('title') };
}

export default function SignInRoute() {
  return (
    <Suspense fallback={<FullPageBusyState />}>
      <SignInPage />
    </Suspense>
  );
}
