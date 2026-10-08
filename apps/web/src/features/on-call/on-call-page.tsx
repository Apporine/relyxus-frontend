'use client';

import { Button, EmptyState, Tooltip } from '@relyxus/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { PageLoadFailedState } from '@/lib/ui/page-states';
import { useMediaQuery } from '@/lib/ui/use-media-query';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { EscalationPanel } from './escalation-panel';
import { onCallHref, selectedScheduleIdFromSearchParams } from './on-call-params';
import { useEscalationChain, useOnCallScheduleDetail, useOnCallSchedules } from './queries';
import { ScheduleDetailPanel } from './schedule-detail-panel';
import { ScheduleListPanel } from './schedule-list-panel';

const THREE_COLUMN_MEDIA_QUERY = '(min-width: 90rem)';

/** On-call and escalation (UI/UX s. 13.4): schedules, coverage and escalation chains. */
export function OnCallPage() {
  const translateOnCall = useTranslations('onCall');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace } = useCurrentWorkspace();
  const showsThreeColumns = useMediaQuery(THREE_COLUMN_MEDIA_QUERY);
  const selectedScheduleId = selectedScheduleIdFromSearchParams(searchParams);

  const schedulesQuery = useOnCallSchedules(workspace.slug);
  const schedules = schedulesQuery.data ?? [];
  const resolvedScheduleId =
    selectedScheduleId !== null && schedules.some((schedule) => schedule.id === selectedScheduleId)
      ? selectedScheduleId
      : (schedules[0]?.id ?? null);

  useEffect(() => {
    if (schedulesQuery.isPending || schedulesQuery.isError) {
      return;
    }
    if (resolvedScheduleId === null || resolvedScheduleId === selectedScheduleId) {
      return;
    }
    router.replace(onCallHref(workspace.slug, resolvedScheduleId), { scroll: false });
  }, [
    resolvedScheduleId,
    router,
    schedulesQuery.isError,
    schedulesQuery.isPending,
    selectedScheduleId,
    workspace.slug,
  ]);

  const detailQuery = useOnCallScheduleDetail(workspace.slug, resolvedScheduleId);
  const escalationQuery = useEscalationChain(workspace.slug, resolvedScheduleId);

  if (schedulesQuery.isPending) {
    return <PageLoadingState />;
  }

  if (schedulesQuery.isError) {
    return (
      <PageLoadFailedState
        error={schedulesQuery.error}
        sectionName={translateOnCall('title')}
        onRetry={() => void schedulesQuery.refetch()}
      />
    );
  }

  const addOverrideButton = (
    <Tooltip content={translateOnCall('addOverrideUnavailable')}>
      <Button variant="primary" disabled>
        {translateOnCall('addOverride')}
      </Button>
    </Tooltip>
  );

  const detailColumn =
    resolvedScheduleId === null ? (
      <EmptyState
        kind="first-use"
        title={translateOnCall('noSelectionTitle')}
        description={translateOnCall('noSelectionDescription')}
      />
    ) : (
      <ScheduleDetailPanel query={detailQuery} />
    );

  const escalationColumn =
    resolvedScheduleId === null ? null : <EscalationPanel query={escalationQuery} />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateOnCall('title')}
        description={translateOnCall('description')}
        actions={addOverrideButton}
      />

      {showsThreeColumns ? (
        <div className="grid grid-cols-[minmax(17rem,320px)_minmax(0,1fr)_minmax(17rem,270px)] items-start gap-6">
          <ScheduleListPanel
            workspaceSlug={workspace.slug}
            query={schedulesQuery}
            selectedScheduleId={resolvedScheduleId}
          />
          {detailColumn}
          {escalationColumn}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <ScheduleListPanel
            workspaceSlug={workspace.slug}
            query={schedulesQuery}
            selectedScheduleId={resolvedScheduleId}
          />
          {detailColumn}
          {escalationColumn}
        </div>
      )}
    </div>
  );
}
