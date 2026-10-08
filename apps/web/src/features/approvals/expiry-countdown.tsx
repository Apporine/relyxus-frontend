'use client';

import { cn, formatCountdown, useCurrentTime } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

const COUNTDOWN_REFRESH_MS = 1_000;
/** UI/UX s. 6: approval expiry warns at two minutes left. */
const FINAL_WARNING_MS = 120_000;

/**
 * Time left on an approval. The interface never extends the security time limit; once it
 * passes, the approval is void and shows as expired (Product s. 10).
 */
export function ExpiryCountdown({ expiresAt, className }: { expiresAt: Date; className?: string }) {
  const translateApprovals = useTranslations('approvals');
  const currentTime = useCurrentTime(COUNTDOWN_REFRESH_MS);
  const remainingMs = currentTime === null ? null : expiresAt.getTime() - currentTime.getTime();
  const hasExpired = remainingMs !== null && remainingMs <= 0;
  const isInFinalWarning = remainingMs !== null && remainingMs <= FINAL_WARNING_MS;

  return (
    <span
      role="timer"
      className={cn(
        'inline-flex h-7 items-center rounded-full border px-3 text-meta font-semibold tabular-nums',
        isInFinalWarning ? 'border-critical text-critical' : 'border-warning text-warning',
        className,
      )}
    >
      {hasExpired
        ? translateApprovals('expired')
        : translateApprovals('timeLeft', {
            time: remainingMs === null ? '--:--' : formatCountdown(remainingMs),
          })}
    </span>
  );
}
