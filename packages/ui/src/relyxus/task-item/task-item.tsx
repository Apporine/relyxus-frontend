import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import type { TaskStatus } from '../vocabulary';

const statusClassNames = {
  open: 'text-fg-secondary',
  'in-progress': 'text-fg-primary',
  blocked: 'text-warning',
  done: 'text-healthy',
  cancelled: 'text-fg-tertiary',
} satisfies Record<TaskStatus, string>;

export type TaskItemProps = {
  title: string;
  status: TaskStatus;
  statusLabel: string;
  /** Null when nobody owns the task; unassigned tasks are highlighted (Product s. 11). */
  ownerName: string | null;
  unassignedLabel: string;
  /** App-formatted due time, for example "Due 12:45 GST". */
  dueText?: string;
  /** Localised "Overdue" word; present only when the task is past due. */
  overdueLabel?: string;
  actions?: ReactNode;
  className?: string;
};

/** A live incident task: who is doing what, and whether it is stuck (UI/UX s. 10.6). */
export function TaskItem({
  title,
  status,
  statusLabel,
  ownerName,
  unassignedLabel,
  dueText,
  overdueLabel,
  actions,
  className,
}: TaskItemProps) {
  return (
    <div
      data-status={status}
      className={cn(
        'grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-1 border-b border-divider py-3',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="truncate text-table font-semibold text-fg-primary">{title}</p>
        {dueText === undefined && overdueLabel === undefined ? null : (
          <p className="flex gap-2 text-meta text-fg-tertiary">
            {dueText}
            {overdueLabel === undefined ? null : (
              <span className="font-semibold text-critical">{overdueLabel}</span>
            )}
          </p>
        )}
      </div>
      <p className={cn('text-table font-semibold', statusClassNames[status])}>{statusLabel}</p>
      <p
        className={cn(
          'text-table',
          ownerName === null ? 'font-semibold text-warning' : 'text-fg-secondary',
        )}
      >
        {ownerName ?? unassignedLabel}
      </p>
      {actions === undefined ? null : <div className="col-span-3 flex gap-3">{actions}</div>}
    </div>
  );
}
