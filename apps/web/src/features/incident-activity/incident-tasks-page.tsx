'use client';

import { Button, Skeleton } from '@relyxus/ui';
import { Lock, OctagonAlert } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { incidentWarRoomHref } from '@/features/incidents/routes';
import { ApiError } from '@/lib/api/api-error';
import { QuerySection } from '@/lib/ui/query-section';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { useActivityIncident, useIncidentTasksList } from './queries';
import { TaskKanbanBoard } from './task-kanban-board';

function NoAccessState() {
  const translateNoAccess = useTranslations('warRoom.noAccess');
  return (
    <section className="flex flex-col items-center gap-3 rounded-panel border border-control bg-surface-1 px-8 py-12 text-center">
      <Lock aria-hidden className="size-6 text-fg-secondary" />
      <h1 className="text-section-title font-semibold">{translateNoAccess('title')}</h1>
      <p className="max-w-prose text-body text-fg-secondary">{translateNoAccess('description')}</p>
    </section>
  );
}

function LoadFailedState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const translateCommon = useTranslations('common');
  const translateTasks = useTranslations('incidentTasks');
  const reference =
    error instanceof ApiError && error.correlationId !== undefined
      ? error.correlationId
      : translateCommon('notReported');
  return (
    <section
      role="alert"
      className="flex flex-col items-start gap-3 rounded-panel border border-critical bg-surface-1 p-6"
    >
      <h1 className="flex items-center gap-2 text-section-title font-semibold">
        <OctagonAlert aria-hidden className="size-5 text-critical" />
        {translateCommon('sectionLoadFailed', { section: translateTasks('title') })}
      </h1>
      <p className="text-body text-fg-secondary">
        {translateCommon('sectionLoadFailedReference', { reference })}
      </p>
      <Button onClick={onRetry}>{translateCommon('retry')}</Button>
    </section>
  );
}

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
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-20 w-full" />
        <TasksPlaceholder />
      </div>
    );
  }

  if (incidentQuery.isError) {
    const { error } = incidentQuery;
    const isHiddenOrMissing =
      error instanceof ApiError && (error.kind === 'forbidden' || error.kind === 'not-found');
    return isHiddenOrMissing ? (
      <NoAccessState />
    ) : (
      <LoadFailedState error={error} onRetry={() => void incidentQuery.refetch()} />
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
