'use client';

import { RelyxusWordmarkLoader } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

/** Client-only boot and session loading screen with the animated Relyxus wordmark. */
export function FullPageBusyState({ label }: { label?: string }) {
  const translateCommon = useTranslations('common');
  return (
    <main
      id="main-content"
      aria-busy="true"
      className="flex min-h-dvh items-center justify-center bg-canvas p-6"
    >
      <RelyxusWordmarkLoader label={label ?? translateCommon('loadingPage')} />
    </main>
  );
}
