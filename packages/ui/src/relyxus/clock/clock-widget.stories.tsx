import type { Meta, StoryObj } from '@storybook/react-vite';

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

const MINUTE_MS = 60_000;

/** Builds a four-hour DORA window that is the given fraction elapsed when the story opens. */
function doraWindowElapsed(elapsedFraction: number) {
  const windowMs = 240 * MINUTE_MS;
  const startedAt = new Date(Date.now() - windowMs * elapsedFraction);
  return { startedAt, deadlineAt: new Date(startedAt.getTime() + windowMs) };
}

const meta = {
  title: 'Relyxus/Clock widget',
  component: ClockWidget,
  args: {
    title: 'DORA initial notice',
    phaseLabels,
    deadlineText: 'Deadline · 15:47 UTC',
    details: 'Owner A. Rahman · EU DORA v1.2',
    ...doraWindowElapsed(0.08),
  },
} satisfies Meta<typeof ClockWidget>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OnTrack: Story = {};

export const PastHalf: Story = {
  args: doraWindowElapsed(0.55),
};

export const PastThreeQuarters: Story = {
  args: doraWindowElapsed(0.8),
};

export const PastNinetyPercent: Story = {
  args: doraWindowElapsed(0.95),
};

export const Breached: Story = {
  args: doraWindowElapsed(1.1),
};

export const Submitted: Story = {
  args: { ...doraWindowElapsed(0.6), isSubmitted: true },
};

export const Compact: Story = {
  args: { size: 'compact', title: 'Tolerance breach · Card payments' },
};
