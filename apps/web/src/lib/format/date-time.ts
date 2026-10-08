/*
 * Time formatting rules from UI/UX s. 16: every time shows its zone, recent events use
 * relative time with the exact time available, and anything older than 24 hours is shown
 * as an absolute date and time. Stored timestamps stay UTC ISO 8601 (Product s. 14).
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 3_600_000;
const RELATIVE_TIME_LIMIT_MS = 24 * MILLISECONDS_PER_HOUR;

export type ZonedFormatting = {
  /** BCP 47 tag that already pins Western digits, from formattingLocaleFor(). */
  formattingLocale: string;
  /** IANA zone, for example "Asia/Dubai" or "UTC". */
  timeZone: string;
};

export function formatTimeOfDay(
  instant: Date,
  { formattingLocale, timeZone }: ZonedFormatting,
  { includeSeconds = false }: { includeSeconds?: boolean } = {},
): string {
  return new Intl.DateTimeFormat(formattingLocale, {
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
    hourCycle: 'h23',
    timeZone,
    timeZoneName: 'short',
  }).format(instant);
}

export function formatDateAndTime(
  instant: Date,
  { formattingLocale, timeZone }: ZonedFormatting,
): string {
  return new Intl.DateTimeFormat(formattingLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone,
    timeZoneName: 'short',
  }).format(instant);
}

/** "4 min ago" inside 24 hours, an absolute date and time beyond that. */
export function formatRecency(instant: Date, now: Date, zonedFormatting: ZonedFormatting): string {
  const elapsedMs = now.getTime() - instant.getTime();
  if (Math.abs(elapsedMs) >= RELATIVE_TIME_LIMIT_MS) {
    return formatDateAndTime(instant, zonedFormatting);
  }

  const relativeTimeFormat = new Intl.RelativeTimeFormat(zonedFormatting.formattingLocale, {
    numeric: 'auto',
    style: 'short',
  });
  if (Math.abs(elapsedMs) >= MILLISECONDS_PER_HOUR) {
    return relativeTimeFormat.format(-Math.round(elapsedMs / MILLISECONDS_PER_HOUR), 'hour');
  }
  return relativeTimeFormat.format(-Math.round(elapsedMs / MILLISECONDS_PER_MINUTE), 'minute');
}
