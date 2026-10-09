'use client';

import { cn, formatCountdown, useCurrentTime } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { timeToBreachMs } from './business-service-tolerance';
import type { Tolerance } from './model';

const COUNTDOWN_REFRESH_MS = 1_000;

/** Live "time to breach", or the time spent outside tolerance once breached (UI/UX s. 12.5). */
export function TimeToBreach({
  tolerance,
  className,
}: {
  tolerance: Tolerance;
  className?: string;
}) {
  const translateTolerance = useTranslations('businessServices.tolerance');
  const currentTime = useCurrentTime(COUNTDOWN_REFRESH_MS);
  if (tolerance.disruptionStartedAt === null) {
    return null;
  }
  const remainingMs = currentTime === null ? null : timeToBreachMs(tolerance, currentTime);
  const hasBreached = remainingMs !== null && remainingMs <= 0;

  return (
    <span
      role="timer"
      className={cn(
        'text-meta font-semibold tabular-nums',
        hasBreached || tolerance.state !== 'within' ? 'text-critical' : 'text-warning',
        className,
      )}
    >
      {remainingMs === null
        ? translateTolerance('timeToBreach', { time: '--:--' })
        : hasBreached
          ? translateTolerance('outsideTolerance', { time: formatCountdown(-remainingMs) })
          : translateTolerance('timeToBreach', { time: formatCountdown(remainingMs) })}
    </span>
  );
}
