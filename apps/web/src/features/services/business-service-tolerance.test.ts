import { describe, expect, it } from 'vitest';

import {
  downtimeBudgetRemainingShare,
  timeToBreachMs,
  toleranceConsumedShare,
  toleranceDeadline,
} from './business-service-tolerance';
import type { Tolerance } from './model';

const disruptedTolerance: Tolerance = {
  toleranceMinutes: 45,
  disruptionStartedAt: '2026-10-09T10:00:00Z',
  state: 'within',
};
const undisruptedTolerance: Tolerance = { ...disruptedTolerance, disruptionStartedAt: null };

describe('tolerance arithmetic', () => {
  it('places the breach at the end of the tolerance window', () => {
    expect(toleranceDeadline(disruptedTolerance)?.toISOString()).toBe('2026-10-09T10:45:00.000Z');
  });

  it('reports the time left and the share consumed during a disruption', () => {
    const now = new Date('2026-10-09T10:30:00Z');

    expect(timeToBreachMs(disruptedTolerance, now)).toBe(15 * 60_000);
    expect(toleranceConsumedShare(disruptedTolerance, now)).toBeCloseTo(2 / 3);
  });

  it('goes negative and past the whole window once breached', () => {
    const now = new Date('2026-10-09T11:00:00Z');

    expect(timeToBreachMs(disruptedTolerance, now)).toBe(-15 * 60_000);
    expect(toleranceConsumedShare(disruptedTolerance, now)).toBeCloseTo(4 / 3);
  });

  it('has no deadline while the service is not disrupted', () => {
    const now = new Date('2026-10-09T11:00:00Z');

    expect(toleranceDeadline(undisruptedTolerance)).toBeNull();
    expect(timeToBreachMs(undisruptedTolerance, now)).toBeNull();
    expect(toleranceConsumedShare(undisruptedTolerance, now)).toBeNull();
  });

  it('never reports a negative downtime budget', () => {
    expect(
      downtimeBudgetRemainingShare({ period: 'month', allowedMinutes: 120, usedMinutes: 71 }),
    ).toBeCloseTo(49 / 120);
    expect(
      downtimeBudgetRemainingShare({ period: 'year', allowedMinutes: 240, usedMinutes: 300 }),
    ).toBe(0);
  });
});
