'use client';

import {
  ClockWidget,
  clockPhases,
  ProgressBar,
  Skeleton,
  useCurrentTime,
  type ClockPhase,
} from '@relyxus/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { incidentWarRoomHref } from '@/features/incidents/routes';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';
import { DataTable } from '@/lib/ui/data-table';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import type { ComplianceOverview, RegulatorClock } from './model';
import {
  complianceQueryKeys,
  regulatorClockEvents,
  useActiveRegulatorClocks,
  useComplianceOverview,
} from './queries';

const REMAINING_TIME_REFRESH_MS = 60_000;

type ComplianceIncident = ComplianceOverview['incidents'][number];

function ActiveClocks({ clocks }: { clocks: readonly RegulatorClock[] }) {
  const translateCompliance = useTranslations('compliance');
  const translatePhases = useTranslations('domain.clockPhases');
  const format = useRelyxusFormat();
  const phaseLabels = Object.fromEntries(
    clockPhases.map((phase) => [phase, translatePhases(phase)]),
  ) as Record<ClockPhase, string>;

  if (clocks.length === 0) {
    return <p className="text-body text-fg-secondary">{translateCompliance('noActiveClocks')}</p>;
  }
  return (
    <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
      {clocks.map((clock) => (
        <ClockWidget
          key={clock.id}
          title={clock.obligationName}
          startedAt={new Date(clock.startedAt)}
          deadlineAt={new Date(clock.deadlineAt)}
          isSubmitted={clock.isSubmitted}
          phaseLabels={phaseLabels}
          deadlineText={translateCompliance('deadline', {
            time: format.timeOfDay(new Date(clock.deadlineAt)),
          })}
          details={translateCompliance('clockDetails', {
            incident: clock.incidentReference,
            rulePackage: clock.rulePackage,
            owner: clock.ownerName,
          })}
        />
      ))}
    </div>
  );
}

function AttentionTable({ incidents }: { incidents: readonly ComplianceIncident[] }) {
  const translateAttention = useTranslations('compliance.attention');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(REMAINING_TIME_REFRESH_MS);
  const { workspace } = useCurrentWorkspace();

  return (
    <DataTable<ComplianceIncident>
      caption={translateAttention('title')}
      rows={incidents}
      getRowKey={(incident) => incident.reference}
      emptyText={translateAttention('empty')}
      columns={[
        {
          key: 'incident',
          header: translateAttention('columns.incident'),
          isRowHeader: true,
          render: (incident) => (
            <Link
              href={incidentWarRoomHref(workspace.slug, incident.reference)}
              className="underline-offset-2 hover:underline"
            >
              <span dir="ltr" className="font-mono text-fg-tertiary">
                {incident.reference}
              </span>{' '}
              {incident.title}
            </Link>
          ),
        },
        {
          key: 'classification',
          header: translateAttention('columns.classification'),
          render: (incident) => translateAttention(`classifications.${incident.classification}`),
        },
        {
          key: 'clock',
          header: translateAttention('columns.clock'),
          className: 'tabular-nums',
          render: (incident) => {
            if (incident.clock === null) {
              return translateAttention('noClock');
            }
            if (incident.clock.isSubmitted) {
              return translateAttention('submitted');
            }
            return currentTime === null
              ? null
              : format.deadline(
                  Date.parse(incident.clock.deadlineAt) - currentTime.getTime(),
                  new Date(incident.clock.deadlineAt),
                );
          },
        },
        {
          key: 'report',
          header: translateAttention('columns.report'),
          render: (incident) => translateAttention(`reportStates.${incident.reportState}`),
        },
        {
          key: 'owner',
          header: translateAttention('columns.owner'),
          render: (incident) => incident.ownerName ?? translateAttention('unassigned'),
        },
      ]}
    />
  );
}

function DeadlineAttention({ deadlines }: { deadlines: ComplianceOverview['deadlines'] }) {
  const translateDeadlines = useTranslations('compliance.deadlines');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(REMAINING_TIME_REFRESH_MS);
  const sortedDeadlines = deadlines.toSorted(
    (first, second) => Date.parse(first.dueAt) - Date.parse(second.dueAt),
  );

  return (
    <Panel title={translateDeadlines('title')}>
      <p className="-mt-2 text-meta text-fg-secondary">{translateDeadlines('description')}</p>
      {sortedDeadlines.length === 0 ? (
        <p className="text-body text-fg-secondary">{translateDeadlines('empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-divider">
          {sortedDeadlines.map((deadline) => (
            <li key={deadline.id} className="flex flex-col gap-0.5 py-2 first:pt-0">
              <span className="text-table font-semibold">{deadline.obligationName}</span>
              <span className="text-meta text-fg-secondary">{deadline.subject}</span>
              <span className="text-meta font-semibold text-warning tabular-nums">
                {currentTime === null
                  ? null
                  : format.deadline(
                      Date.parse(deadline.dueAt) - currentTime.getTime(),
                      new Date(deadline.dueAt),
                    )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function EvidencePacks({ packs }: { packs: ComplianceOverview['evidencePacks'] }) {
  const translatePacks = useTranslations('compliance.evidencePacks');
  return (
    <Panel title={translatePacks('title')}>
      <p className="-mt-2 text-meta text-fg-secondary">{translatePacks('description')}</p>
      {packs.length === 0 ? (
        <p className="text-body text-fg-secondary">{translatePacks('empty')}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {packs.map((pack) => {
            const status = translatePacks('status', {
              completeness: pack.completenessPercent / 100,
              missing: pack.missingSourceCount,
            });
            return (
              <li key={pack.incidentReference} className="flex flex-col gap-1">
                <span className="flex items-baseline justify-between gap-3 text-table">
                  <span dir="ltr" className="font-mono font-semibold">
                    {pack.incidentReference}
                  </span>
                  <span
                    className={
                      pack.missingSourceCount === 0
                        ? 'text-meta text-healthy'
                        : 'text-meta text-warning'
                    }
                  >
                    {status}
                  </span>
                </span>
                <ProgressBar
                  label={translatePacks('progressLabel', { incident: pack.incidentReference })}
                  value={pack.completenessPercent}
                  valueText={status}
                />
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/** Compliance Centre (UI/UX s. 12.1, Figma frame 16): deadlines, classification and evidence. */
export function ComplianceCentrePage() {
  const translateCompliance = useTranslations('compliance');
  const { workspace } = useCurrentWorkspace();
  const clocksQuery = useActiveRegulatorClocks(workspace.slug);
  const overviewQuery = useComplianceOverview(workspace.slug);
  useRefreshOnLiveEvents(regulatorClockEvents, complianceQueryKeys.activeClocks(workspace.slug));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateCompliance('title')}
        description={translateCompliance('description')}
      />
      <Panel title={translateCompliance('activeClocks')}>
        <QuerySection
          query={clocksQuery}
          sectionName={translateCompliance('activeClocks')}
          loadingPlaceholder={<Skeleton className="h-32 w-full" />}
        >
          {(clocks) => <ActiveClocks clocks={clocks} />}
        </QuerySection>
      </Panel>
      <QuerySection
        query={overviewQuery}
        sectionName={translateCompliance('overviewSectionName')}
        loadingPlaceholder={<Skeleton className="h-96 w-full" />}
      >
        {(overview) => (
          <div className="grid items-start gap-6 laptop:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
            <Panel title={translateCompliance('attention.title')}>
              <AttentionTable incidents={overview.incidents} />
            </Panel>
            <div className="flex flex-col gap-6">
              <DeadlineAttention deadlines={overview.deadlines} />
              <EvidencePacks packs={overview.evidencePacks} />
            </div>
          </div>
        )}
      </QuerySection>
    </div>
  );
}
