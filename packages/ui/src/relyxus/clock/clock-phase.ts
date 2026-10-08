/*
 * Regulator and tolerance clocks warn at 50, 75 and 90 percent of their window and are
 * breached at the deadline (Product s. 12; UI/UX s. 7 clock widget states).
 */

export const clockPhases = [
  'normal',
  'past-half',
  'past-three-quarters',
  'past-ninety-percent',
  'breached',
  'submitted',
] as const;
export type ClockPhase = (typeof clockPhases)[number];

const PHASE_THRESHOLDS: ReadonlyArray<{ minimumElapsedFraction: number; phase: ClockPhase }> = [
  { minimumElapsedFraction: 0.9, phase: 'past-ninety-percent' },
  { minimumElapsedFraction: 0.75, phase: 'past-three-quarters' },
  { minimumElapsedFraction: 0.5, phase: 'past-half' },
];

export type ClockWindow = {
  startedAt: Date;
  deadlineAt: Date;
  /** A submitted obligation is complete, however late; it never shows as breached again. */
  isSubmitted: boolean;
};

export function clockPhaseAt(
  { startedAt, deadlineAt, isSubmitted }: ClockWindow,
  now: Date,
): ClockPhase {
  if (isSubmitted) {
    return 'submitted';
  }
  if (now.getTime() >= deadlineAt.getTime()) {
    return 'breached';
  }
  const windowMs = deadlineAt.getTime() - startedAt.getTime();
  const elapsedFraction = windowMs <= 0 ? 1 : (now.getTime() - startedAt.getTime()) / windowMs;
  const reachedThreshold = PHASE_THRESHOLDS.find(
    ({ minimumElapsedFraction }) => elapsedFraction >= minimumElapsedFraction,
  );
  return reachedThreshold?.phase ?? 'normal';
}

const MILLISECONDS_PER_SECOND = 1_000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3_600;

/** Formats remaining time as HH:MM:SS with tabular digits; hours may exceed 99 for long windows. */
export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / MILLISECONDS_PER_SECOND));
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}
