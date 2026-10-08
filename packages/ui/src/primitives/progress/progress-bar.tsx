import { Progress as ProgressPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

export type ProgressBarProps = {
  /** Accessible name, for example "Replay progress". */
  label: string;
  value: number;
  max?: number;
  /** Spoken value, for example "12 of 40 incidents replayed". */
  valueText: string;
  className?: string;
};

export function ProgressBar({ label, value, max = 100, valueText, className }: ProgressBarProps) {
  const completedPercentage = Math.min(Math.max(value / max, 0), 1) * 100;

  return (
    <ProgressPrimitive.Root
      aria-label={label}
      aria-valuetext={valueText}
      value={value}
      max={max}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-2', className)}
    >
      <ProgressPrimitive.Indicator
        className="h-full bg-action transition-[width] duration-(--rx-duration-panel) ease-standard"
        style={{ width: `${completedPercentage}%` }}
      />
    </ProgressPrimitive.Root>
  );
}
