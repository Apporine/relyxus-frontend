'use client';

import { RelyxusUiProvider, type TextDirection } from '@relyxus/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTimeZone, useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';

import { createQueryClient } from '@/lib/api/query-client';
import { TimeDisplayProvider } from '@/lib/format/time-display';

const FALLBACK_TIME_ZONE = 'UTC';

type AppProvidersProps = {
  direction: TextDirection;
  children: ReactNode;
};

/** Client-side context shared by every page: server state, design system, toasts and time display. */
export function AppProviders({ direction, children }: AppProvidersProps) {
  const translateUi = useTranslations('ui');
  const preferredTimeZone = useTimeZone() ?? FALLBACK_TIME_ZONE;
  // One query cache per browser session; created lazily so server renders never share it.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <RelyxusUiProvider
        direction={direction}
        toastLabels={{
          region: translateUi('notificationsRegion'),
          dismiss: translateUi('dismissNotification'),
        }}
      >
        <TimeDisplayProvider preferredTimeZone={preferredTimeZone}>{children}</TimeDisplayProvider>
      </RelyxusUiProvider>
    </QueryClientProvider>
  );
}
