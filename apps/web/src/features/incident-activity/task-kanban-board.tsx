'use client';

import { cn } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import type { IncidentTask } from '@/features/war-room/model';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';

const kanbanColumns = ['open', 'in-progress', 'blocked', 'done'] as const;

type KanbanColumnStatus = (typeof kanbanColumns)[number];

const columnIndicatorClassNames = {
  open: 'bg-fg-secondary',
  'in-progress': 'bg-warning',
  blocked: 'bg-critical',
  done: 'bg-healthy',
} satisfies Record<KanbanColumnStatus, string>;

function TaskKanbanCard({ task }: { task: IncidentTask }) {
  const translateActivity = useTranslations('warRoom.activity');
  const format = useRelyxusFormat();

  const timeLabel =
    task.statusDetail ??
    (task.dueAt === null
      ? undefined
      : format.timeOfDay(new Date(task.dueAt), { includeSeconds: false }));

  return (
    <article className="rounded-md bg-surface-0 border border-control p-4">
      <h3 className="text-table font-semibold text-fg-primary">{task.title}</h3>
      <p className="mt-2 text-meta text-fg-secondary">
        {task.ownerName ?? translateActivity('unassigned')}
      </p>
      {timeLabel === undefined ? null : (
        <p
          className={cn(
            'mt-1 font-mono text-meta tabular-nums',
            task.statusDetail === undefined ? 'text-fg-tertiary' : 'font-medium text-warning',
          )}
        >
          {timeLabel}
        </p>
      )}
    </article>
  );
}

/** Kanban board for incident tasks (Figma frame 08). */
export function TaskKanbanBoard({ tasks }: { tasks: IncidentTask[] }) {
  const translateTasks = useTranslations('incidentTasks');
  const translateActivity = useTranslations('warRoom.activity');

  const tasksByColumn = Object.fromEntries(
    kanbanColumns.map((status) => [status, tasks.filter((task) => task.status === status)]),
  ) as Record<KanbanColumnStatus, IncidentTask[]>;

  const visibleTaskCount = tasks.filter((task) => task.status !== 'cancelled').length;
  if (visibleTaskCount === 0) {
    return <p className="text-body text-fg-secondary">{translateActivity('noTasks')}</p>;
  }

  return (
    <div className="xl:grid-cols-4 grid grid-cols-1 gap-4">
      {kanbanColumns.map((status) => (
        <section
          key={status}
          aria-labelledby={`task-column-${status}`}
          className="flex min-h-80 flex-col gap-3 rounded-panel border border-control bg-surface-1 p-4"
        >
          <header className="flex items-center gap-2">
            <span
              aria-hidden
              className={cn('size-2 rounded-full', columnIndicatorClassNames[status])}
            />
            <h2
              id={`task-column-${status}`}
              className="text-meta font-semibold tracking-wide text-fg-secondary uppercase"
            >
              {translateTasks(`columns.${status}`)}
            </h2>
          </header>
          <div className="flex flex-col gap-3">
            {tasksByColumn[status].length === 0 ? (
              <p className="text-meta text-fg-tertiary">{translateTasks('emptyColumn')}</p>
            ) : (
              tasksByColumn[status].map((task) => <TaskKanbanCard key={task.id} task={task} />)
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
