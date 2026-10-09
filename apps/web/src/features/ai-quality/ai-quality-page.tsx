'use client';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
} from '@relyxus/ui';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';
import { QuerySection } from '@/lib/ui/query-section';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { AiQualityNotices } from './ai-quality-notices';
import { CalibrationPanel } from './calibration-panel';
import { MissesPanel } from './misses-panel';
import { ModelRoutesPanel } from './model-routes-panel';
import {
  aiQualityEvents,
  aiQualityQueryKeys,
  useModelRoutes,
  useReplayRuns,
  useScorecard,
} from './queries';
import { ReplayRunsPanel } from './replay-runs-panel';
import { ScorecardMetrics } from './scorecard-metrics';

/** Model-governance actions whose contracts are not defined yet (open question Q20). */
const pendingGovernanceActions = [
  'compare',
  'approveRoute',
  'startShadowMode',
  'exportValidationPack',
] as const;

function AiQualityActions() {
  const translateActions = useTranslations('aiQuality.actions');
  const unavailableNoteId = useId();
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary">
              {translateActions('more')}
              <ChevronDown aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-w-72">
            <DropdownMenuLabel>{translateActions('unavailable')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {pendingGovernanceActions.map((action) => (
              <DropdownMenuItem key={action} disabled>
                {translateActions(action)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="primary" disabled aria-describedby={unavailableNoteId}>
          {translateActions('createReplay')}
        </Button>
      </div>
      <p id={unavailableNoteId} className="max-w-80 text-end text-meta text-fg-tertiary">
        {translateActions('createReplayUnavailable')}
      </p>
    </div>
  );
}

/** Replay and AI quality (UI/UX s. 11.7): is the AI right, and why was each model approved? */
export function AiQualityPage() {
  const translateAiQuality = useTranslations('aiQuality');
  const { workspace } = useCurrentWorkspace();
  const scorecardQuery = useScorecard(workspace.slug);
  const routesQuery = useModelRoutes(workspace.slug);
  const runsQuery = useReplayRuns(workspace.slug);
  useRefreshOnLiveEvents(aiQualityEvents, aiQualityQueryKeys.all(workspace.slug));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateAiQuality('title')}
        description={translateAiQuality('description')}
        actions={<AiQualityActions />}
      />

      <AiQualityNotices scorecard={scorecardQuery.data} routes={routesQuery.data} />

      <QuerySection
        query={scorecardQuery}
        sectionName={translateAiQuality('scorecard.sectionName')}
        loadingPlaceholder={<Skeleton className="h-96 w-full" />}
      >
        {(scorecard) => (
          <>
            <ScorecardMetrics scorecard={scorecard} />
            <div className="grid gap-6 laptop:grid-cols-2">
              <CalibrationPanel buckets={scorecard.calibration} />
              <MissesPanel misses={scorecard.misses} />
            </div>
          </>
        )}
      </QuerySection>

      <QuerySection
        query={routesQuery}
        sectionName={translateAiQuality('routes.title')}
        loadingPlaceholder={<Skeleton className="h-64 w-full" />}
      >
        {(routes) => <ModelRoutesPanel workspaceSlug={workspace.slug} routes={routes} />}
      </QuerySection>

      <QuerySection
        query={runsQuery}
        sectionName={translateAiQuality('runs.title')}
        loadingPlaceholder={<Skeleton className="h-48 w-full" />}
      >
        {(runs) => <ReplayRunsPanel workspaceSlug={workspace.slug} runs={runs} />}
      </QuerySection>
    </div>
  );
}
