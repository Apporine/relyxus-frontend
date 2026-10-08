import { CircleCheck, Clock, OctagonAlert, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { useCurrentTime } from '../../lib/use-current-time';
import { clockPhaseAt, formatCountdown, type ClockPhase } from './clock-phase';

const COUNTDOWN_REFRESH_MS = 1_000;
const COUNTDOWN_PLACEHOLDER = '--:--:--';

const phasePresentation = {
  normal: { textClassName: 'text-fg-primary', icon: <Clock aria-hidden /> },
  'past-half': { textClassName: 'text-warning', icon: <Clock aria-hidden /> },
  'past-three-quarters': { textClassName: 'text-major', icon: <TriangleAlert aria-hidden /> },
  'past-ninety-percent': { textClassName: 'text-critical', icon: <OctagonAlert aria-hidden /> },
  breached: { textClassName: 'text-critical', icon: <OctagonAlert aria-hidden /> },
  submitted: { textClassName: 'text-healthy', icon: <CircleCheck aria-hidden /> },
} satisfies Record<ClockPhase, { textClassName: string; icon: ReactNode }>;

export type ClockWidgetProps = {
  /** Obligation name, for example "DORA initial notice". */
  title: string;
  startedAt: Date;
  deadlineAt: Date;
  isSubmitted?: boolean;
  /** Localised words for each phase, so the state is never conveyed by colour alone. */
  phaseLabels: Record<ClockPhase, string>;
  /** App-formatted deadline with its time zone, for example "Deadline · 15:47 UTC". */
  deadlineText: string;
  /** Owner, rule package and version, shown beneath the deadline. */
  details?: ReactNode;
  size?: 'compact' | 'prominent';
  className?: string;
};

/**
 * Regulator or tolerance countdown. The countdown is a timer that assistive technology does
 * not announce every second; the phase word changes at each threshold instead.
 */
export function ClockWidget({
  title,
  startedAt,
  deadlineAt,
  isSubmitted = false,
  phaseLabels,
  deadlineText,
  details,
  size = 'prominent',
  className,
}: ClockWidgetProps) {
  const currentTime = useCurrentTime(COUNTDOWN_REFRESH_MS);
  const phase =
    currentTime === null
      ? 'normal'
      : clockPhaseAt({ startedAt, deadlineAt, isSubmitted }, currentTime);
  const countdown =
    currentTime === null
      ? COUNTDOWN_PLACEHOLDER
      : formatCountdown(deadlineAt.getTime() - currentTime.getTime());
  const { textClassName, icon } = phasePresentation[phase];

  return (
    <section aria-label={title} data-phase={phase} className={cn('flex flex-col gap-1', className)}>
      <p className="text-meta font-semibold text-fg-secondary">{title}</p>
      {isSubmitted ? null : (
        <p
          role="timer"
          className={cn(
            'font-semibold tabular-nums',
            size === 'prominent' ? 'text-metric' : 'text-panel-title',
            textClassName,
          )}
        >
          <bdi>{countdown}</bdi>
        </p>
      )}
      <p
        className={cn(
          'flex items-center gap-1.5 text-meta font-semibold [&_svg]:size-4',
          textClassName,
        )}
      >
        {icon}
        {phaseLabels[phase]}
      </p>
      <p className="text-meta text-fg-secondary">{deadlineText}</p>
      {details === undefined ? null : <div className="text-meta text-fg-secondary">{details}</div>}
    </section>
  );
}
