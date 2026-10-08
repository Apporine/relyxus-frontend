'use client';

import { EmptyState, SeverityBadge, Skeleton, StateBadge, useCurrentTime } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { NewUpdatesPill } from '@/lib/live/new-updates-pill';
import { useLiveUpdateBuffer } from '@/lib/live/use-live-update-buffer';
import { QuerySection } from '@/lib/ui/query-section';

import { IncidentListImpact } from './incident-list-impact';
import type { IncidentSummary } from './model';
import { incidentWarRoomHref } from './routes';

const AGE_REFRESH_MS = 60_000;
const PLACEHOLDER_ROW_COUNT = 5;

const incidentReferenceOf = (incident: IncidentSummary) => incident.reference;

function IncidentListRows({
  workspaceSlug,
  incidents,
}: {
  workspaceSlug: string;
  incidents: IncidentSummary[];
}) {
  const translateList = useTranslations('incidents.list');
  const translateStates = useTranslations('domain.incidentStates');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(AGE_REFRESH_MS);
  const { visibleItems, pendingItems, revealPending } = useLiveUpdateBuffer(
    incidents,
    incidentReferenceOf,
    { hasLoaded: true },
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center empty:hidden">
        <NewUpdatesPill pendingCount={pendingItems.length} onReveal={revealPending} />
      </div>
      <div className="overflow-x-auto rounded-panel border border-control bg-surface-1">
        <table className="w-full min-w-[56rem] text-table">
          <thead className="bg-surface-2">
            <tr className="border-b border-divider text-start text-meta text-fg-tertiary uppercase">
              <th scope="col" className="px-4 py-2 text-start font-semibold">
                {translateList('columns.idTitle')}
              </th>
              <th scope="col" className="px-4 py-2 text-start font-semibold">
                {translateList('columns.severity')}
              </th>
              <th scope="col" className="px-4 py-2 text-start font-semibold">
                {translateList('columns.state')}
              </th>
              <th scope="col" className="px-4 py-2 text-start font-semibold">
                {translateList('columns.businessService')}
              </th>
              <th scope="col" className="px-4 py-2 text-start font-semibold">
                {translateList('columns.owner')}
              </th>
              <th scope="col" className="px-4 py-2 text-start font-semibold">
                {translateList('columns.impact')}
              </th>
              <th scope="col" className="px-4 py-2 text-start font-semibold">
                {translateList('columns.opened')}
              </th>
              <th scope="col" className="px-4 py-2 text-end font-semibold">
                {translateList('columns.age')}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((incident) => (
              <tr key={incident.reference} className="border-b border-divider last:border-b-0">
                <td className="px-4 py-3">
                  <Link
                    href={incidentWarRoomHref(workspaceSlug, incident.reference)}
                    className="font-mono text-fg-primary hover:underline"
                    dir="ltr"
                  >
                    <span className="text-meta text-fg-tertiary">{incident.reference}</span>{' '}
                    <span className="font-sans font-semibold">{incident.title}</span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td className="px-4 py-3">
                  <StateBadge label={translateStates(incident.state)} />
                </td>
                <td className="px-4 py-3 text-fg-secondary">
                  {incident.businessServiceNames[0] ?? translateList('noBusinessService')}
                </td>
                <td className="px-4 py-3 text-fg-secondary">
                  {incident.ownerTeamName ?? translateList('noOwner')}
                </td>
                <td className="px-4 py-3">
                  <IncidentListImpact impact={incident.impact} />
                </td>
                <td className="px-4 py-3 text-fg-secondary tabular-nums">
                  {format.timeOfDay(new Date(incident.declaredAt))}
                </td>
                <td className="px-4 py-3 text-end text-fg-secondary tabular-nums">
                  {currentTime === null
                    ? null
                    : format.duration(
                        currentTime.getTime() - new Date(incident.impactStartedAt).getTime(),
                      )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function IncidentListTable({
  workspaceSlug,
  workspaceName,
  query,
}: {
  workspaceSlug: string;
  workspaceName: string;
  query: UseQueryResult<IncidentSummary[]>;
}) {
  const translateList = useTranslations('incidents.list');

  return (
    <QuerySection
      query={query}
      sectionName={translateList('tableSectionName')}
      loadingPlaceholder={
        <div className="flex flex-col gap-3">
          {Array.from({ length: PLACEHOLDER_ROW_COUNT }, (_, rowIndex) => (
            <Skeleton key={rowIndex} className="h-10 w-full" />
          ))}
        </div>
      }
    >
      {(incidents) =>
        incidents.length === 0 ? (
          <EmptyState
            kind="filtered"
            headingLevel={2}
            title={translateList('emptyTitle', { workspace: workspaceName })}
            description={translateList('emptyDescription')}
          />
        ) : (
          <IncidentListRows workspaceSlug={workspaceSlug} incidents={incidents} />
        )
      }
    </QuerySection>
  );
}
