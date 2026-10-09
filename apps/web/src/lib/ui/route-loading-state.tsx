'use client';

import { RelyxusWordmarkLoader } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

/**
 * Shown in the content area while the next page loads, so moving between screens never leaves
 * a blank page. The console navigation stays in place around it.
 */
export function RouteLoadingState() {
  const translateCommon = useTranslations('common');
  return (
    <div aria-busy="true" className="flex min-h-[60dvh] items-center justify-center">
      <RelyxusWordmarkLoader label={translateCommon('loadingPage')} />
    </div>
  );
}
