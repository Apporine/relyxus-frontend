'use client';

import { Button, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@relyxus/ui';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { incidentEvidenceHref } from '@/features/incidents/routes';
import { useMediaQuery } from '@/lib/ui/use-media-query';
import { useSearchParamChoice } from '@/lib/ui/use-search-param-choice';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { ActivityPanel } from './activity-panel';
import { DecisionsPanel } from './decisions-panel';
import { InvestigationPanel } from './investigation-panel';
import { useWarRoomData } from './queries';
import { useAcknowledgeIncidentAction } from './use-acknowledge-incident-action';
import { useWarRoomShortcuts } from './use-war-room-shortcuts';
import { WarRoomHeader } from './war-room-header';

/** UI/UX s. 15: three panels on desktop (1440 px and wider), tabs below that. */
const THREE_PANEL_MEDIA_QUERY = '(min-width: 90rem)';
const compactPanels = ['investigation', 'decisions', 'activity'] as const;

function WarRoomLoadingState() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-6 desktop:grid-cols-3">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

/** Incident War Room (UI/UX s. 10.4): the one authoritative screen for running an incident. */
export function WarRoomPage({ incidentReference }: { incidentReference: string }) {
  const translatePanels = useTranslations('warRoom.panels');
  const translateDecisions = useTranslations('warRoom.decisions');
  const router = useRouter();
  const { workspace } = useCurrentWorkspace();
  const warRoomData = useWarRoomData(workspace.slug, incidentReference);
  const { incidentQuery, investigationQuery, actionsQuery, clocksQuery, communicationsQuery } =
    warRoomData;
  const acknowledgeAction = useAcknowledgeIncidentAction(workspace.slug, incidentQuery.data);
  const showsThreePanels = useMediaQuery(THREE_PANEL_MEDIA_QUERY);
  const [compactPanel, selectCompactPanel] = useSearchParamChoice(
    'panel',
    compactPanels,
    'investigation',
  );

  useWarRoomShortcuts({
    onAcknowledge: acknowledgeAction.acknowledge,
    onOpenEvidence: () => router.push(incidentEvidenceHref(workspace.slug, incidentReference)),
  });

  if (incidentQuery.isPending) {
    return <WarRoomLoadingState />;
  }
  if (incidentQuery.isError) {
    const { error } = incidentQuery;
    return isHiddenOrMissing(error) ? (
      <NoAccessState />
    ) : (
      <PageLoadFailedState
        error={error}
        sectionName={translatePanels('tabsLabel')}
        onRetry={() => void incidentQuery.refetch()}
      />
    );
  }

  const investigationPanel = (
    <InvestigationPanel
      workspaceSlug={workspace.slug}
      incidentReference={incidentReference}
      query={investigationQuery}
    />
  );
  const decisionsPanel = (
    <DecisionsPanel
      workspaceSlug={workspace.slug}
      actionsQuery={actionsQuery}
      clocksQuery={clocksQuery}
      communicationsQuery={communicationsQuery}
    />
  );
  const activityPanel = (
    <ActivityPanel
      workspaceSlug={workspace.slug}
      incidentReference={incidentReference}
      timelineQuery={warRoomData.timelineQuery}
      tasksQuery={warRoomData.tasksQuery}
    />
  );
  const pendingDecisionCount = actionsQuery.data?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <WarRoomHeader
        incident={incidentQuery.data}
        clocks={clocksQuery.data}
        acknowledgeAction={acknowledgeAction}
      />

      {showsThreePanels ? (
        <div className="grid grid-cols-[minmax(17rem,1fr)_minmax(0,2fr)_minmax(20rem,1.3fr)] items-start gap-6">
          {activityPanel}
          {investigationPanel}
          {decisionsPanel}
        </div>
      ) : (
        <Tabs value={compactPanel} onValueChange={selectCompactPanel}>
          {pendingDecisionCount > 0 && compactPanel !== 'decisions' ? (
            <p className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-panel border border-warning bg-warning-subtle px-4 py-3 text-body font-semibold">
              {translateDecisions('pendingDecisionsNotice', { count: pendingDecisionCount })}
              <Button size="small" onClick={() => selectCompactPanel('decisions')}>
                {translateDecisions('viewDecisions')}
              </Button>
            </p>
          ) : null}
          <TabsList aria-label={translatePanels('tabsLabel')}>
            {compactPanels.map((panel) => (
              <TabsTrigger
                key={panel}
                value={panel}
                count={panel === 'decisions' ? pendingDecisionCount : undefined}
              >
                {translatePanels(panel)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="investigation">{investigationPanel}</TabsContent>
          <TabsContent value="decisions">{decisionsPanel}</TabsContent>
          <TabsContent value="activity">{activityPanel}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
