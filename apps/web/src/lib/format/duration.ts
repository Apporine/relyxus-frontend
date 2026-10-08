const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3_600;

export type DurationParts = {
  hours: number;
  minutes: number;
  seconds: number;
};

/** Splits a non-negative duration into whole hours, minutes and seconds. */
export function splitDuration(durationMs: number): DurationParts {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1_000));
  return {
    hours: Math.floor(totalSeconds / SECONDS_PER_HOUR),
    minutes: Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: totalSeconds % SECONDS_PER_MINUTE,
  };
}
