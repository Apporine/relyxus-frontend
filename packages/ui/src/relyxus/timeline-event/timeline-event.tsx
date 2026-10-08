import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import type { TimelineActorKind } from '../vocabulary';

export type TimelineEventProps = {
  /** A <time> element formatted by the app, so its time zone and UTC toggle stay consistent. */
  time: ReactNode;
  actorKind: TimelineActorKind;
  /** Display name, for example "Sara M.", "AI", "System" or "Prometheus". */
  actorName: string;
  /** Localised actor type read by screen readers when the name alone is ambiguous. */
  actorKindLabel: string;
  summary: ReactNode;
  /** Highlights events that wait on someone, such as a requested approval. */
  needsAttention?: boolean;
  /** Links to the related evidence, task, approval or action. */
  links?: ReactNode;
  className?: string;
};

/**
 * One entry in an incident timeline. Render inside an ordered list. Corrections are new
 * events, never edits of this one (UI/UX s. 7).
 */
export function TimelineEvent({
  time,
  actorKind,
  actorName,
  actorKindLabel,
  summary,
  needsAttention = false,
  links,
  className,
}: TimelineEventProps) {
  return (
    <li
      data-actor-kind={actorKind}
      className={cn('grid grid-cols-[4.5rem_auto_1fr] gap-x-3', className)}
    >
      <span className="pt-0.5 font-mono text-meta text-fg-tertiary tabular-nums">{time}</span>
      <span
        aria-hidden
        className={cn(
          'mt-2 size-2 rounded-full',
          needsAttention ? 'bg-warning' : 'bg-fg-secondary',
        )}
      />
      <div className="flex min-w-0 flex-col gap-0.5 pb-4">
        <p className="text-table font-semibold text-fg-primary">
          {actorName}
          <span className="sr-only"> ({actorKindLabel})</span>
        </p>
        <div className="text-table text-fg-secondary">{summary}</div>
        {links === undefined ? null : <div className="flex flex-wrap gap-3 text-meta">{links}</div>}
      </div>
    </li>
  );
}
