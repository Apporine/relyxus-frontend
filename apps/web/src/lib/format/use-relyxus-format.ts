'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { formattingLocaleFor } from '../i18n/locales';
import {
  formatDateAndTime,
  formatRecency,
  formatTimeOfDay,
  type ZonedFormatting,
} from './date-time';
import { splitDuration } from './duration';
import { formatCompactCount, formatMoney, type MoneyAmount } from './money';
import { useTimeDisplay } from './time-display';

/**
 * Formatting bound to the viewer's language, Western digits and the zone currently shown on
 * the page, so every screen formats times, durations and money the same way.
 */
export function useRelyxusFormat() {
  const locale = useLocale();
  const translateTime = useTranslations('time');
  const { displayTimeZone } = useTimeDisplay();

  return useMemo(() => {
    const zonedFormatting: ZonedFormatting = {
      formattingLocale: formattingLocaleFor(locale),
      timeZone: displayTimeZone,
    };

    /** "2h 51m", "14m" or "40s"; with seconds, durations under an hour read "2m 41s". */
    function duration(durationMs: number, { includeSeconds = false } = {}): string {
      const { hours, minutes, seconds } = splitDuration(durationMs);
      if (hours > 0) {
        return translateTime('durationHoursMinutes', { hours, minutes });
      }
      if (minutes > 0) {
        return includeSeconds
          ? translateTime('durationMinutesSeconds', { minutes, seconds })
          : translateTime('durationMinutes', { minutes });
      }
      return translateTime('durationSeconds', { seconds });
    }

    return {
      timeOfDay: (instant: Date, options?: { includeSeconds?: boolean }) =>
        formatTimeOfDay(instant, zonedFormatting, options),
      dateAndTime: (instant: Date) => formatDateAndTime(instant, zonedFormatting),
      recency: (instant: Date, now: Date) => formatRecency(instant, now, zonedFormatting),
      duration,
      deadline: (remainingMs: number, dueAt: Date) =>
        translateTime('deadlineRemaining', {
          remaining: duration(remainingMs),
          dueTime: formatTimeOfDay(dueAt, zonedFormatting),
        }),
      money: (amount: MoneyAmount) => formatMoney(amount, zonedFormatting.formattingLocale),
      compactCount: (count: number) => formatCompactCount(count, zonedFormatting.formattingLocale),
    };
  }, [locale, displayTimeZone, translateTime]);
}
