import { render, type RenderResult } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

import { AppProviders } from '@/app/app-providers';
import { textDirectionFor, type SupportedLocale } from '@/lib/i18n/locales';
import arabicMessages from '@/messages/ar.json';
import englishMessages from '@/messages/en.json';

const messagesByLocale = { en: englishMessages, ar: arabicMessages } satisfies Record<
  SupportedLocale,
  typeof englishMessages
>;

/**
 * Renders with the same providers as the root layout, in the requested locale and zone.
 * Providers are applied as a wrapper so `rerender` keeps them.
 */
export function renderWithIntl(
  element: ReactElement,
  { locale = 'en', timeZone = 'UTC' }: { locale?: SupportedLocale; timeZone?: string } = {},
): RenderResult {
  function IntlProviders({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider
        locale={locale}
        messages={messagesByLocale[locale]}
        timeZone={timeZone}
      >
        <AppProviders direction={textDirectionFor(locale)}>{children}</AppProviders>
      </NextIntlClientProvider>
    );
  }

  return render(element, { wrapper: IntlProviders });
}
