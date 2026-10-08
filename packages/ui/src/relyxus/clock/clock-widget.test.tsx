import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../test/render';
import type { ClockPhase } from './clock-phase';
import { ClockWidget } from './clock-widget';

const phaseLabels: Record<ClockPhase, string> = {
  normal: 'On track',
  'past-half': 'Past 50% of the window',
  'past-three-quarters': 'Past 75% of the window',
  'past-ninety-percent': 'Past 90% of the window',
  breached: 'Breached',
  submitted: 'Submitted',
};

function renderDoraClock(isSubmitted = false) {
  return renderWithProviders(
    <ClockWidget
      title="DORA initial notice"
      startedAt={new Date('2026-10-07T11:47:00Z')}
      deadlineAt={new Date('2026-10-07T15:47:00Z')}
      isSubmitted={isSubmitted}
      phaseLabels={phaseLabels}
      deadlineText="Deadline · 15:47 UTC"
    />,
  );
}

describe('ClockWidget', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-07T12:05:38Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down to the deadline every second', () => {
    renderDoraClock();
    expect(screen.getByRole('timer')).toHaveTextContent('03:41:22');

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(screen.getByRole('timer')).toHaveTextContent('03:41:21');
  });

  it('writes the phase in words as well as colour', () => {
    vi.setSystemTime(new Date('2026-10-07T15:30:00Z'));
    renderDoraClock();

    const clock = screen.getByRole('region', { name: 'DORA initial notice' });
    expect(clock).toHaveAttribute('data-phase', 'past-ninety-percent');
    expect(clock).toHaveTextContent('Past 90% of the window');
  });

  it('shows a breached clock as breached with no time left', () => {
    vi.setSystemTime(new Date('2026-10-07T16:00:00Z'));
    renderDoraClock();

    expect(screen.getByRole('timer')).toHaveTextContent('00:00:00');
    expect(screen.getByText('Breached')).toBeInTheDocument();
  });

  it('stops counting once the obligation is submitted', () => {
    renderDoraClock(true);

    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });
});
