import { describe, expect, it } from 'vitest';

import { clockPhaseAt, formatCountdown } from './clock-phase';

// DORA initial notice: four hours from classification.
const doraInitialNotice = {
  startedAt: new Date('2026-10-07T11:47:00Z'),
  deadlineAt: new Date('2026-10-07T15:47:00Z'),
  isSubmitted: false,
};

describe('clockPhaseAt', () => {
  it.each([
    ['2026-10-07T12:00:00Z', 'normal'],
    ['2026-10-07T13:47:00Z', 'past-half'],
    ['2026-10-07T14:47:00Z', 'past-three-quarters'],
    ['2026-10-07T15:23:00Z', 'past-ninety-percent'],
    ['2026-10-07T15:47:00Z', 'breached'],
    ['2026-10-07T18:00:00Z', 'breached'],
  ] as const)('at %s the clock is %s', (instant, expectedPhase) => {
    expect(clockPhaseAt(doraInitialNotice, new Date(instant))).toBe(expectedPhase);
  });

  it('reports a submitted obligation as submitted even after its deadline', () => {
    expect(
      clockPhaseAt({ ...doraInitialNotice, isSubmitted: true }, new Date('2026-10-07T18:00:00Z')),
    ).toBe('submitted');
  });

  it('treats a zero-length window as fully elapsed rather than dividing by zero', () => {
    const instant = new Date('2026-10-07T11:00:00Z');
    const oneSecondBefore = new Date(instant.getTime() - 1_000);
    expect(
      clockPhaseAt(
        { startedAt: instant, deadlineAt: instant, isSubmitted: false },
        oneSecondBefore,
      ),
    ).toBe('past-ninety-percent');
  });
});

describe('formatCountdown', () => {
  it.each([
    [13_282_000, '03:41:22'],
    [198_000, '00:03:18'],
    [0, '00:00:00'],
    [-5_000, '00:00:00'],
    [2_592_000_000, '720:00:00'],
  ])('formats %i ms as %s', (remainingMs, expected) => {
    expect(formatCountdown(remainingMs)).toBe(expected);
  });
});
