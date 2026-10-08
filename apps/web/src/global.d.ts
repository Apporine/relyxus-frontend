import type { SupportedLocale } from './lib/i18n/locales';
import type englishMessages from './messages/en.json';

// Types next-intl's hooks and functions: unknown message keys and missing ICU arguments
// become compile errors, and locales are limited to the supported set.
declare module 'next-intl' {
  interface AppConfig {
    Locale: SupportedLocale;
    Messages: typeof englishMessages;
  }
}
