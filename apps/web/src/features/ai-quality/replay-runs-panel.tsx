'use client';

import { ProgressBar } from '@relyxus/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { Panel } from '@/lib/ui/panel';

import type { ReplayRunSummary } from './model';
import { replayRunHref } from './routes';

function ReplayRunStatus({ run }: { run: ReplayRunSummary }) {
  const translateRuns = useTranslations('aiQuality.runs');
  const format = useRelyxusFormat();

  if (run.status === 'running' && run.progressPercent !== null) {
    const progressText = translateRuns('progress', {
      progress: run.progressPercent / 100,
      time:
        run.estimatedCompletionAt === null
          ? translateRuns('noEstimate')
          : format.timeOfDay(new Date(run.estimatedCompletionAt)),
    });
    return (
      <div className="flex flex-col gap-1">
        <ProgressBar
          label={translateRuns('progressLabel', { name: run.name })}
          value={run.progressPercent}
          valueText={progressText}
        />
        <span className="text-meta text-fg-secondary">{progressText}</span>
      </div>
    );
  }

  if (run.status === 'completed' && run.results !== null) {
    return (
      <span className="text-meta text-fg-secondary tabular-nums">
        {translateRuns('results', {
          correctFirst: run.results.correctFirstPercent / 100,
          topThree: run.results.topThreePercent / 100,
          minutesSaved: run.results.minutesSavedPerIncident,
        })}
      </span>
    );
  }

  return (
    <span
      className={
        run.status === 'failed'
          ? 'text-meta font-semibold text-critical'
          : 'text-meta text-fg-secondary'
      }
    >
      {translateRuns(`statuses.${run.status}`)}
    </span>
  );
}

/** Replays run past incidents with only the data that existed at the time (Product s. 10). */
export function ReplayRunsPanel({
  workspaceSlug,
  runs,
}: {
  workspaceSlug: string;
  runs: readonly ReplayRunSummary[];
}) {
  const translateRuns = useTranslations('aiQuality.runs');

  return (
    <Panel title={translateRuns('title')}>
      {runs.length === 0 ? (
        <p className="text-body text-fg-secondary">{translateRuns('empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-divider">
          {runs.map((run) => (
            <li key={run.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <Link
                  href={replayRunHref(workspaceSlug, run.id)}
                  className="text-table font-semibold text-fg-primary underline-offset-2 hover:underline"
                >
                  {run.name}
                </Link>
                <span className="text-meta text-fg-secondary">
                  {translateRuns('scope', { route: run.routeName, incidents: run.incidentsTested })}
                </span>
              </span>
              <ReplayRunStatus run={run} />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
