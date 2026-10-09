import type { BusinessServiceDetail, Tolerance } from './model';

/*
 * Impact-tolerance arithmetic (Product s. 12). The tolerance window runs from the start of
 * the disruption; the interface never extends it.
 */

const MILLISECONDS_PER_MINUTE = 60_000;

/** When the tolerance is breached, or null while the service is not disrupted. */
export function toleranceDeadline(tolerance: Tolerance): Date | null {
  if (tolerance.disruptionStartedAt === null) {
    return null;
  }
  return new Date(
    Date.parse(tolerance.disruptionStartedAt) +
      tolerance.toleranceMinutes * MILLISECONDS_PER_MINUTE,
  );
}

/** Share of the tolerance window used so far; above 1 once breached, null when not disrupted. */
export function toleranceConsumedShare(tolerance: Tolerance, now: Date): number | null {
  if (tolerance.disruptionStartedAt === null) {
    return null;
  }
  const elapsedMs = Math.max(0, now.getTime() - Date.parse(tolerance.disruptionStartedAt));
  return elapsedMs / (tolerance.toleranceMinutes * MILLISECONDS_PER_MINUTE);
}

/** Milliseconds left before breach; negative once breached, null when not disrupted. */
export function timeToBreachMs(tolerance: Tolerance, now: Date): number | null {
  const deadline = toleranceDeadline(tolerance);
  return deadline === null ? null : deadline.getTime() - now.getTime();
}

/** Share of the downtime budget still available in its period, never below zero. */
export function downtimeBudgetRemainingShare(
  budget: BusinessServiceDetail['downtimeBudget'],
): number {
  return Math.max(0, 1 - budget.usedMinutes / budget.allowedMinutes);
}
