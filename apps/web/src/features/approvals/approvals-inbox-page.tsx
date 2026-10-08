'use client';

import { EmptyState, Skeleton } from '@relyxus/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';
import { useCanChangeState } from '@/lib/live/live-updates-provider';
import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { useMediaQuery } from '@/lib/ui/use-media-query';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { ApprovalConsequenceLadder } from './approval-consequence-ladder';
import { approvalsInboxHref, selectedApprovalIdFromSearchParams } from './approval-params';
import { ApprovalQueue } from './approval-queue';
import { ApprovalRequestDetail } from './approval-request-detail';
import {
  approvalQueryKeys,
  pendingApprovalEvents,
  useApprovalDetail,
  usePendingApprovalsForMe,
  usePendingApprovalsForOthers,
} from './queries';

const THREE_COLUMN_MEDIA_QUERY = '(min-width: 90rem)';

function NoSelectionState() {
  const translateInbox = useTranslations('approvals.inbox');
  return (
    <EmptyState
      kind="all-clear"
      title={translateInbox('noSelectionTitle')}
      description={translateInbox('noSelectionDescription')}
    />
  );
}

/** Approval Governance Inbox (UI/UX s. 11.2): workspace-wide queue and decision surface. */
export function ApprovalsInboxPage() {
  const translateInbox = useTranslations('approvals.inbox');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace } = useCurrentWorkspace();
  const selectedApprovalId = selectedApprovalIdFromSearchParams(searchParams);
  const canChangeState = useCanChangeState();
  const showsThreeColumns = useMediaQuery(THREE_COLUMN_MEDIA_QUERY);

  const waitingForMeQuery = usePendingApprovalsForMe(workspace.slug);
  const waitingForOthersQuery = usePendingApprovalsForOthers(workspace.slug);

  useRefreshOnLiveEvents(pendingApprovalEvents, approvalQueryKeys.all(workspace.slug));

  const queuesReady =
    !waitingForMeQuery.isPending &&
    !waitingForOthersQuery.isPending &&
    !waitingForMeQuery.isError &&
    !waitingForOthersQuery.isError;
  const urgentItems = waitingForMeQuery.data ?? [];
  const othersItems = waitingForOthersQuery.data ?? [];
  const queueItems = [...urgentItems, ...othersItems];
  const resolvedSelectedId =
    selectedApprovalId !== null && queueItems.some((item) => item.id === selectedApprovalId)
      ? selectedApprovalId
      : (urgentItems[0]?.id ?? othersItems[0]?.id ?? null);

  useEffect(() => {
    if (!queuesReady) {
      return;
    }
    if (resolvedSelectedId === null || resolvedSelectedId === selectedApprovalId) {
      return;
    }
    router.replace(approvalsInboxHref(workspace.slug, resolvedSelectedId), { scroll: false });
  }, [queuesReady, resolvedSelectedId, router, selectedApprovalId, workspace.slug]);

  const detailQuery = useApprovalDetail(workspace.slug, resolvedSelectedId);

  function selectNextApproval() {
    const remaining = queueItems.filter((item) => item.id !== resolvedSelectedId);
    router.replace(approvalsInboxHref(workspace.slug, remaining[0]?.id ?? null), {
      scroll: false,
    });
  }

  if (waitingForMeQuery.isPending || waitingForOthersQuery.isPending) {
    return <PageLoadingState />;
  }

  if (waitingForMeQuery.isError && waitingForOthersQuery.isError) {
    const error = waitingForMeQuery.error ?? waitingForOthersQuery.error;
    return (
      <PageLoadFailedState
        error={error}
        sectionName={translateInbox('title')}
        onRetry={() => {
          void waitingForMeQuery.refetch();
          void waitingForOthersQuery.refetch();
        }}
      />
    );
  }

  const pendingCount = urgentItems.length;

  const detailPanel =
    resolvedSelectedId === null ? (
      <NoSelectionState />
    ) : detailQuery.isPending ? (
      <Skeleton className="h-[32rem] w-full" aria-busy="true" />
    ) : detailQuery.isError ? (
      isHiddenOrMissing(detailQuery.error) ? (
        <NoAccessState />
      ) : (
        <PageLoadFailedState
          error={detailQuery.error}
          sectionName={translateInbox('detailSectionName')}
          onRetry={() => void detailQuery.refetch()}
        />
      )
    ) : (
      <ApprovalRequestDetail approval={detailQuery.data} />
    );

  const ladderPanel =
    resolvedSelectedId !== null && detailQuery.isSuccess ? (
      <ApprovalConsequenceLadder
        workspaceSlug={workspace.slug}
        approval={detailQuery.data}
        canChangeState={canChangeState}
        onDecided={selectNextApproval}
      />
    ) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateInbox('title')}
        description={translateInbox('description')}
        actions={
          pendingCount > 0 ? (
            <span className="inline-flex h-7 items-center rounded-full border border-warning px-3 text-meta font-semibold text-warning">
              {translateInbox('pendingCount', { count: pendingCount })}
            </span>
          ) : (
            <span className="inline-flex h-7 items-center rounded-full border border-control px-3 text-meta font-semibold text-fg-secondary">
              {translateInbox('pendingCount', { count: 0 })}
            </span>
          )
        }
      />

      {showsThreeColumns ? (
        <div className="grid grid-cols-[minmax(17rem,360px)_minmax(0,1fr)_minmax(17rem,320px)] items-start gap-6">
          <ApprovalQueue
            workspaceSlug={workspace.slug}
            waitingForMeQuery={waitingForMeQuery}
            waitingForOthersQuery={waitingForOthersQuery}
            selectedApprovalId={resolvedSelectedId}
          />
          {detailPanel}
          {ladderPanel}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <ApprovalQueue
            workspaceSlug={workspace.slug}
            waitingForMeQuery={waitingForMeQuery}
            waitingForOthersQuery={waitingForOthersQuery}
            selectedApprovalId={resolvedSelectedId}
          />
          {detailPanel}
          {ladderPanel}
        </div>
      )}
    </div>
  );
}
