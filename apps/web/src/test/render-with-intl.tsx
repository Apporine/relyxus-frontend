import { render, type RenderResult } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement } from 'react';

import { AppProviders } from '@/app/app-providers';
import { textDirectionFor, type SupportedLocale } from '@/lib/i18n/locales';
import arabicMessages from '@/messages/ar.json';
import englishMessages from '@/messages/en.json';

const messagesByLocale = { en: englishMessages, ar: arabicMessages } satisfies Record<
  SupportedLocale,
  typeof englishMessages
>;

/** Renders with the same providers as the root layout, in the requested locale and zone. */
export function renderWithIntl(
  element: ReactElement,
  { locale = 'en', timeZone = 'UTC' }: { locale?: SupportedLocale; timeZone?: string } = {},
): RenderResult {
  return render(
    <NextIntlClientProvider locale={locale} messages={messagesByLocale[locale]} timeZone={timeZone}>
      <AppProviders direction={textDirectionFor(locale)}>{element}</AppProviders>
    </NextIntlClientProvider>,
  );
}
