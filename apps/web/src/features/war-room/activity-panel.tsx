'use client';

import {
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TaskItem,
  TimelineEvent,
} from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { NewUpdatesPill } from '@/lib/live/new-updates-pill';
import { useLiveUpdateBuffer } from '@/lib/live/use-live-update-buffer';
import { QuerySection } from '@/lib/ui/query-section';
import { useSearchParamChoice } from '@/lib/ui/use-search-param-choice';

import type { IncidentTask, TimelineEntry } from './model';

const activityTabs = ['timeline', 'tasks'] as const;
const PLACEHOLDER_ROW_COUNT = 5;

const timelineEntryIdOf = (entry: TimelineEntry) => entry.id;

function ActivityPlaceholder() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: PLACEHOLDER_ROW_COUNT }, (_, rowIndex) => (
        <Skeleton key={rowIndex} className="h-10 w-full" />
      ))}
    </div>
  );
}

function IncidentTimeline({ entries }: { entries: TimelineEntry[] }) {
  const translateActivity = useTranslations('warRoom.activity');
  const format = useRelyxusFormat();
  // New entries wait behind the pill so the timeline never moves under the reader.
  const { visibleItems, pendingItems, revealPending } = useLiveUpdateBuffer(
    entries,
    timelineEntryIdOf,
    {
      hasLoaded: true,
    },
  );

  if (visibleItems.length === 0 && pendingItems.length === 0) {
    return <p className="text-body text-fg-secondary">{translateActivity('noTimeline')}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      <ol>
        {visibleItems.map((entry) => (
          <TimelineEvent
            key={entry.id}
            time={
              <time dateTime={entry.occurredAt}>
                {format.timeOfDay(new Date(entry.occurredAt), { includeSeconds: true })}
              </time>
            }
            actorKind={entry.actorKind}
            actorName={entry.actorName}
            actorKindLabel={translateActivity(`actorKinds.${entry.actorKind}`)}
            summary={entry.summary}
            needsAttention={entry.needsAttention}
          />
        ))}
      </ol>
      <div className="flex justify-center empty:hidden">
        <NewUpdatesPill pendingCount={pendingItems.length} onReveal={revealPending} />
      </div>
    </div>
  );
}

function IncidentTasks({ tasks }: { tasks: IncidentTask[] }) {
  const translateActivity = useTranslations('warRoom.activity');
  const format = useRelyxusFormat();

  if (tasks.length === 0) {
    return <p className="text-body text-fg-secondary">{translateActivity('noTasks')}</p>;
  }
  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          title={task.title}
          status={task.status}
          statusLabel={translateActivity(`taskStatuses.${task.status}`)}
          ownerName={task.ownerName}
          unassignedLabel={translateActivity('unassigned')}
          dueText={
            task.dueAt === null
              ? undefined
              : translateActivity('due', { time: format.timeOfDay(new Date(task.dueAt)) })
          }
          overdueLabel={task.isOverdue ? translateActivity('overdue') : undefined}
        />
      ))}
    </div>
  );
}

/** Timeline and tasks, switchable by tab with the choice kept in the URL (UI/UX s. 10.4). */
export function ActivityPanel({
  timelineQuery,
  tasksQuery,
}: {
  timelineQuery: UseQueryResult<TimelineEntry[]>;
  tasksQuery: UseQueryResult<IncidentTask[]>;
}) {
  const translatePanels = useTranslations('warRoom.panels');
  const translateActivity = useTranslations('warRoom.activity');
  const [activeTab, selectTab] = useSearchParamChoice('activity', activityTabs, 'timeline');
  const openTaskCount = tasksQuery.data?.filter(
    (task) => task.status !== 'done' && task.status !== 'cancelled',
  ).length;

  return (
    <section
      aria-label={translatePanels('activity')}
      className="flex flex-col gap-4 rounded-panel border border-control bg-surface-1 p-5"
    >
      <Tabs value={activeTab} onValueChange={selectTab} variant="contained">
        <TabsList aria-label={translatePanels('activity')} className="w-fit">
          <TabsTrigger value="timeline">{translateActivity('timeline')}</TabsTrigger>
          <TabsTrigger value="tasks" count={openTaskCount}>
            {translateActivity('tasks')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="timeline">
          <QuerySection
            query={timelineQuery}
            sectionName={translateActivity('timeline')}
            loadingPlaceholder={<ActivityPlaceholder />}
          >
            {(entries) => <IncidentTimeline entries={entries} />}
          </QuerySection>
        </TabsContent>
        <TabsContent value="tasks">
          <QuerySection
            query={tasksQuery}
            sectionName={translateActivity('tasks')}
            loadingPlaceholder={<ActivityPlaceholder />}
          >
            {(tasks) => <IncidentTasks tasks={tasks} />}
          </QuerySection>
        </TabsContent>
      </Tabs>
    </section>
  );
}
