'use client';

import { cn, useCurrentTime } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailContent } from '@/lib/ui/list-detail-content';
import { SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import type { RunbookDetail, RunbookStepKind, RunbookSummary } from './model';
import { runbookQueries } from './queries';

const RECENCY_REFRESH_MS = 60_000;

/** Gates and actions change production state, so they stand out from read and verify steps. */
const stepKindClassNames = {
  read: 'border-divider',
  gate: 'border-warning',
  action: 'border-critical',
  verify: 'border-divider',
  manual: 'border-divider',
} satisfies Record<RunbookStepKind, string>;

function RunbookSteps({ runbook }: { runbook: RunbookDetail }) {
  const translateRunbooks = useTranslations('runbooks');
  return (
    <Panel title={runbook.name}>
      <p className="-mt-2 text-meta text-fg-secondary">
        {translateRunbooks('versionLine', {
          source: translateRunbooks(`sources.${runbook.source}`),
          version: runbook.version,
        })}
      </p>
      <ol className="flex flex-col gap-3">
        {runbook.steps.map((step) => (
          <li
            key={step.number}
            className={cn(
              'flex flex-col gap-1 rounded-panel border bg-raised px-4 py-3',
              stepKindClassNames[step.kind],
            )}
          >
            <span className="text-meta font-semibold text-fg-tertiary uppercase">
              {translateRunbooks('stepLabel', {
                number: step.number,
                kind: translateRunbooks(`stepKinds.${step.kind}`),
              })}
            </span>
            <span className="text-table">{step.description}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function ExecutionHistory({ runbook }: { runbook: RunbookDetail }) {
  const translateRunbooks = useTranslations('runbooks');
  const { latestRun } = runbook;
  return (
    <Panel title={translateRunbooks('history.title')}>
      {latestRun === null ? (
        <p className="text-body text-fg-secondary">{translateRunbooks('history.empty')}</p>
      ) : (
        <StackedFacts
          facts={[
            {
              label: translateRunbooks('history.latestRun'),
              value: (
                <span dir="ltr" className="font-mono">
                  {latestRun.incidentReference}
                </span>
              ),
            },
            {
              label: translateRunbooks('history.result'),
              value: translateRunbooks(`results.${latestRun.result}`),
              className: latestRun.result === 'succeeded' ? 'text-healthy' : 'text-critical',
            },
            {
              label: translateRunbooks('history.version'),
              value: translateRunbooks(
                latestRun.isVersionPinned ? 'history.pinnedVersion' : 'history.unpinnedVersion',
                { version: latestRun.version },
              ),
            },
            { label: translateRunbooks('history.recovery'), value: latestRun.recovery },
          ]}
        />
      )}
    </Panel>
  );
}

function useRunbookListMeta() {
  const translateRunbooks = useTranslations('runbooks');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(RECENCY_REFRESH_MS);
  return (runbook: RunbookSummary) => {
    const source = translateRunbooks(`sources.${runbook.source}`);
    if (runbook.isReviewDue) {
      return translateRunbooks('listMetaReviewDue', { source });
    }
    return translateRunbooks('listMeta', {
      source,
      version: runbook.version,
      tested:
        runbook.lastTestedAt === null || currentTime === null
          ? translateRunbooks('neverTested')
          : format.recency(new Date(runbook.lastTestedAt), currentTime),
    });
  };
}

/** Runbooks and playbooks (UI/UX s. 11.6, Figma frame 14). */
export function RunbooksPage() {
  const translateRunbooks = useTranslations('runbooks');
  const { workspace } = useCurrentWorkspace();
  const listMeta = useRunbookListMeta();
  const listQuery = runbookQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'runbook',
    listQuery.data?.map((runbook) => runbook.id),
  );
  const detailQuery = runbookQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateRunbooks('title')}
        description={translateRunbooks('description')}
        actions={
          <UnavailableAction
            label={translateRunbooks('importRunbook')}
            reason={translateRunbooks('importRunbookUnavailable')}
          />
        }
      />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translateRunbooks('title')}
        detailSectionName={translateRunbooks('detailSectionName')}
        renderList={(runbooks) => (
          <SelectableListPanel
            title={translateRunbooks('listTitle')}
            emptyText={translateRunbooks('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={runbooks.map((runbook) => ({
              id: runbook.id,
              title: runbook.name,
              meta: listMeta(runbook),
            }))}
          />
        )}
        renderDetail={(runbook) => <RunbookSteps runbook={runbook} />}
        renderAside={(runbook) => <ExecutionHistory runbook={runbook} />}
      />
    </div>
  );
}
