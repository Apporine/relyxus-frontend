'use client';

import { Button, Skeleton } from '@relyxus/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { incidentWarRoomHref } from '@/features/incidents/routes';
import { QuerySection } from '@/lib/ui/query-section';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { useActivityIncident, useIncidentTasksList } from './queries';
import { TaskKanbanBoard } from './task-kanban-board';

function TasksPlaceholder() {
  return <Skeleton className="h-[32rem] w-full" />;
}

/** Full incident tasks kanban (UI/UX s. 10.6). */
export function IncidentTasksPage({ incidentReference }: { incidentReference: string }) {
  const translateTasks = useTranslations('incidentTasks');
  const { workspace } = useCurrentWorkspace();
  const incidentQuery = useActivityIncident(workspace.slug, incidentReference);
  const tasksQuery = useIncidentTasksList(workspace.slug, incidentReference);

  if (incidentQuery.isPending) {
    return <PageLoadingState />;
  }

  if (incidentQuery.isError) {
    const { error } = incidentQuery;
    return isHiddenOrMissing(error) ? (
      <NoAccessState />
    ) : (
      <PageLoadFailedState
        error={error}
        sectionName={translateTasks('title')}
        onRetry={() => void incidentQuery.refetch()}
      />
    );
  }

  const incident = incidentQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateTasks('title')}
        description={
          <>
            <Link
              href={incidentWarRoomHref(workspace.slug, incidentReference)}
              className="font-semibold text-fg-primary hover:underline"
            >
              {incident.reference}
            </Link>
            {' · '}
            {incident.title}
          </>
        }
        actions={
          <Button disabled title={translateTasks('createTaskUnavailable')}>
            {translateTasks('createTask')}
          </Button>
        }
      />

      <QuerySection
        query={tasksQuery}
        sectionName={translateTasks('title')}
        loadingPlaceholder={<TasksPlaceholder />}
      >
        {(tasks) => <TaskKanbanBoard tasks={tasks} />}
      </QuerySection>
    </div>
  );
}
