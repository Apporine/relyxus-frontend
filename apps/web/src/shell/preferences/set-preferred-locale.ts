'use server';

import { cookies } from 'next/headers';

import { isSupportedLocale, LOCALE_COOKIE_NAME } from '@/lib/i18n/locales';

const ONE_YEAR_IN_SECONDS = 31_536_000;

/**
 * Stores the interface language. Until the user-preferences API exists the choice is kept
 * in a cookie that the i18n request configuration reads on the next render.
 */
export async function setPreferredLocale(requestedLocale: string): Promise<void> {
  if (!isSupportedLocale(requestedLocale)) {
    throw new Error(`Unsupported locale: ${requestedLocale}`);
  }
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, requestedLocale, {
    path: '/',
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
