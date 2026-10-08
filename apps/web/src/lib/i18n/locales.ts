import type { TextDirection } from '@relyxus/ui';

/*
 * Locales the console ships (Product s. 21: English and Arabic). Language is a personal
 * preference (UI/UX s. 13.10), so routes carry no locale segment; the preference is read
 * from a cookie until user preferences are served by the API.
 */

export const supportedLocales = ['en', 'ar'] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'en';

export const LOCALE_COOKIE_NAME = 'relyxus-locale';

/*
 * Western digits are the operational default in both languages (UI/UX s. 6). The Unicode
 * extension keeps Intl formatting from switching to Arabic-Indic digits in Arabic.
 */
const formattingLocaleTags = {
  en: 'en-GB',
  ar: 'ar-u-nu-latn',
} satisfies Record<SupportedLocale, string>;

export function isSupportedLocale(candidate: string | undefined): candidate is SupportedLocale {
  return supportedLocales.some((locale) => locale === candidate);
}

export function textDirectionFor(locale: SupportedLocale): TextDirection {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function formattingLocaleFor(locale: SupportedLocale): string {
  return formattingLocaleTags[locale];
}
