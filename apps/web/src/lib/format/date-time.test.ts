import { describe, expect, it } from 'vitest';

import { formatDateAndTime, formatRecency, formatTimeOfDay } from './date-time';

const englishInUtc = { formattingLocale: 'en-GB', timeZone: 'UTC' };
const arabicInDubai = { formattingLocale: 'ar-u-nu-latn', timeZone: 'Asia/Dubai' };
const arabicIndicDigits = /[٠-٩]/;

const alertFiredAt = new Date('2026-10-07T12:03:00Z');

describe('formatTimeOfDay', () => {
  it('always names the time zone', () => {
    expect(formatTimeOfDay(alertFiredAt, englishInUtc)).toBe('12:03 UTC');
  });

  it('includes seconds for timelines', () => {
    expect(
      formatTimeOfDay(new Date('2026-10-07T12:04:31Z'), englishInUtc, { includeSeconds: true }),
    ).toBe('12:04:31 UTC');
  });

  it('converts to the display zone and keeps Western digits in Arabic', () => {
    const formatted = formatTimeOfDay(alertFiredAt, arabicInDubai);
    expect(formatted).toContain('16:03');
    expect(formatted).not.toMatch(arabicIndicDigits);
  });
});

describe('formatRecency', () => {
  const now = new Date('2026-10-07T12:07:00Z');

  it('uses relative minutes for recent events', () => {
    expect(formatRecency(alertFiredAt, now, englishInUtc)).toBe('4 min ago');
  });

  it('uses relative hours within the last day', () => {
    expect(formatRecency(new Date('2026-10-07T09:07:00Z'), now, englishInUtc)).toBe('3 hr ago');
  });

  it('switches to an absolute date and time after 24 hours', () => {
    const lastWeek = new Date('2026-09-30T08:15:00Z');
    expect(formatRecency(lastWeek, now, englishInUtc)).toBe(
      formatDateAndTime(lastWeek, englishInUtc),
    );
    expect(formatDateAndTime(lastWeek, englishInUtc)).toBe('30 Sept 2026, 08:15 UTC');
  });
});
