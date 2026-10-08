import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { textDirectionFor } from '@/lib/i18n/locales';
import { ApiMockingBoundary } from '@/mocks/api-mocking-boundary';

import { AppProviders } from './app-providers';
import './globals.css';

// Page titles use the template only with non-sensitive names; restricted incident titles
// must never reach document metadata.
export const metadata: Metadata = {
  title: {
    default: 'Relyxus',
    template: '%s · Relyxus',
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();
  const direction = textDirectionFor(locale);

  return (
    <html lang={locale} dir={direction}>
      <body>
        <NextIntlClientProvider>
          <AppProviders direction={direction}>
            <ApiMockingBoundary>{children}</ApiMockingBoundary>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
