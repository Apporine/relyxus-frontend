import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

import { defaultLocale, isSupportedLocale, LOCALE_COOKIE_NAME } from './locales';

/*
 * Times are shown in UTC until the viewer's time-zone preference is served by the API.
 * Every rendered time carries its zone label, so UTC is never mistaken for local time.
 */
const DEFAULT_TIME_ZONE = 'UTC';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const preferredLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isSupportedLocale(preferredLocale) ? preferredLocale : defaultLocale;

  return {
    locale,
    timeZone: DEFAULT_TIME_ZONE,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
