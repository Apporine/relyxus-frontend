'use client';

import { cn, Tabs, TabsContent, TabsList, TabsTrigger } from '@relyxus/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { incidentWarRoomHref } from '@/features/incidents/routes';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { Panel } from '@/lib/ui/panel';
import { useSearchParamChoice } from '@/lib/ui/use-search-param-choice';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import type { ReplayIncident, ReplayOutcome, ReplayRunDetail } from './model';
import { useReplayRun } from './queries';
import { aiQualityHref } from './routes';

const outcomeFilters = ['all', 'missed'] as const;

const outcomeClassNames = {
  'correct-first': 'border-healthy text-healthy',
  'top-three': 'border-warning text-warning',
  missed: 'border-critical text-critical',
} satisfies Record<ReplayOutcome, string>;

/** What was tested, so a model-risk reviewer can reproduce the evaluation (UI/UX s. 11.7). */
function ReproductionFacts({ run }: { run: ReplayRunDetail }) {
  const translateRun = useTranslations('aiQuality.run');
  const translateRuns = useTranslations('aiQuality.runs');
  const format = useRelyxusFormat();
  const facts = [
    { label: translateRun('route'), value: run.routeName },
    { label: translateRun('modelVersion'), value: run.modelVersion, isTechnical: true },
    { label: translateRun('promptVersion'), value: run.promptVersion, isTechnical: true },
    { label: translateRun('incidentsTested'), value: String(run.incidentsTested) },
    { label: translateRun('started'), value: format.dateAndTime(new Date(run.startedAt)) },
    {
      label: translateRun('results'),
      value:
        run.results === null
          ? translateRuns(`statuses.${run.status}`)
          : translateRuns('results', {
              correctFirst: run.results.correctFirstPercent / 100,
              topThree: run.results.topThreePercent / 100,
              minutesSaved: run.results.minutesSavedPerIncident,
            }),
    },
  ];

  return (
    <Panel title={translateRun('reproduce')}>
      <p className="-mt-2 text-meta text-fg-secondary">{translateRun('reproduceDescription')}</p>
      <dl className="grid gap-x-6 gap-y-3 tablet:grid-cols-2 laptop:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-0.5">
            <dt className="text-meta font-semibold text-fg-tertiary uppercase">{fact.label}</dt>
            <dd
              dir={fact.isTechnical === true ? 'ltr' : undefined}
              className={cn('text-table', fact.isTechnical === true && 'text-start font-mono')}
            >
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function ReplayIncidentResult({
  workspaceSlug,
  incident,
}: {
  workspaceSlug: string;
  incident: ReplayIncident;
}) {
  const translateRun = useTranslations('aiQuality.run');
  const format = useRelyxusFormat();
  const headingId = useId();

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-panel border border-divider p-4"
    >
      <header className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            'rounded-full border px-2.5 text-meta font-semibold',
            outcomeClassNames[incident.outcome],
          )}
        >
          {translateRun(`outcomes.${incident.outcome}`)}
        </span>
        <h3 id={headingId} className="text-table font-semibold">
          <Link
            href={incidentWarRoomHref(workspaceSlug, incident.incidentReference)}
            className="underline-offset-2 hover:underline"
          >
            <span dir="ltr" className="font-mono text-fg-tertiary">
              {incident.incidentReference}
            </span>{' '}
            {incident.incidentTitle}
          </Link>
        </h3>
      </header>
      <dl className="grid grid-cols-[minmax(9rem,auto)_1fr] gap-x-4 gap-y-2 text-table">
        <dt className="text-meta font-semibold text-fg-tertiary uppercase">
          {translateRun('actualCause')}
        </dt>
        <dd>{incident.actualCause}</dd>
        <dt className="text-meta font-semibold text-fg-tertiary uppercase">
          {translateRun('topHypothesis')}
        </dt>
        <dd>
          {translateRun('hypothesisWithConfidence', {
            hypothesis: incident.topHypothesis,
            confidence: incident.topHypothesisConfidencePercent / 100,
          })}
        </dd>
        {incident.missReason === null ? null : (
          <>
            <dt className="text-meta font-semibold text-fg-tertiary uppercase">
              {translateRun('missReason')}
            </dt>
            <dd>{incident.missReason}</dd>
          </>
        )}
        <dt className="text-meta font-semibold text-fg-tertiary uppercase">
          {translateRun('timeFence')}
        </dt>
        <dd>
          {translateRun('evidenceCutoff', {
            time: format.dateAndTime(new Date(incident.evidenceCutoffAt)),
          })}
        </dd>
      </dl>
      <details>
        <summary className="cursor-pointer text-table font-semibold text-fg-secondary">
          {translateRun('decisionTrace', { count: incident.decisionTrace.length })}
        </summary>
        <ol className="mt-2 flex list-decimal flex-col gap-1 ps-6 text-table">
          {incident.decisionTrace.map((traceStep) => (
            <li key={traceStep.step}>{traceStep.summary}</li>
          ))}
        </ol>
      </details>
    </article>
  );
}

/** One replay run: what was tested and how the AI did on each incident. */
export function ReplayRunPage({ runId }: { runId: string }) {
  const translateRun = useTranslations('aiQuality.run');
  const translateAiQuality = useTranslations('aiQuality');
  const { workspace } = useCurrentWorkspace();
  const runQuery = useReplayRun(workspace.slug, runId);
  const [outcomeFilter, selectOutcomeFilter] = useSearchParamChoice(
    'outcome',
    outcomeFilters,
    'all',
  );

  if (runQuery.isPending) {
    return <PageLoadingState />;
  }
  if (runQuery.isError) {
    return isHiddenOrMissing(runQuery.error) ? (
      <NoAccessState />
    ) : (
      <PageLoadFailedState
        error={runQuery.error}
        sectionName={translateRun('sectionName')}
        onRetry={() => void runQuery.refetch()}
      />
    );
  }

  const run = runQuery.data;
  const missedIncidents = run.incidents.filter((incident) => incident.outcome === 'missed');
  const incidentsByFilter = { all: run.incidents, missed: missedIncidents };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={aiQualityHref(workspace.slug)}
        className="inline-flex items-center gap-2 self-start text-table text-fg-secondary hover:text-fg-primary"
      >
        <ArrowLeft aria-hidden className="size-4 rtl:rotate-180" />
        {translateAiQuality('title')}
      </Link>
      <PageHeader title={run.name} description={translateRun('description')} />
      <ReproductionFacts run={run} />
      <Panel title={translateRun('incidents')}>
        <Tabs value={outcomeFilter} onValueChange={selectOutcomeFilter} variant="contained">
          <TabsList aria-label={translateRun('filterLabel')}>
            {outcomeFilters.map((filter) => (
              <TabsTrigger key={filter} value={filter} count={incidentsByFilter[filter].length}>
                {translateRun(`filters.${filter}`)}
              </TabsTrigger>
            ))}
          </TabsList>
          {outcomeFilters.map((filter) => (
            <TabsContent key={filter} value={filter} className="flex flex-col gap-3">
              {incidentsByFilter[filter].length === 0 ? (
                <p className="text-body text-fg-secondary">{translateRun(`empty.${filter}`)}</p>
              ) : (
                incidentsByFilter[filter].map((incident) => (
                  <ReplayIncidentResult
                    key={incident.incidentReference}
                    workspaceSlug={workspace.slug}
                    incident={incident}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </Panel>
    </div>
  );
}
