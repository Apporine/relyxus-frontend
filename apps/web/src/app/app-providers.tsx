'use client';

import { RelyxusUiProvider, type TextDirection } from '@relyxus/ui';
import { useTimeZone, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { TimeDisplayProvider } from '@/lib/format/time-display';

const FALLBACK_TIME_ZONE = 'UTC';

type AppProvidersProps = {
  direction: TextDirection;
  children: ReactNode;
};

/** Client-side context shared by every page: design system, toasts and time display. */
export function AppProviders({ direction, children }: AppProvidersProps) {
  const translateUi = useTranslations('ui');
  const preferredTimeZone = useTimeZone() ?? FALLBACK_TIME_ZONE;

  return (
    <RelyxusUiProvider
      direction={direction}
      toastLabels={{
        region: translateUi('notificationsRegion'),
        dismiss: translateUi('dismissNotification'),
      }}
    >
      <TimeDisplayProvider preferredTimeZone={preferredTimeZone}>{children}</TimeDisplayProvider>
    </RelyxusUiProvider>
  );
}
