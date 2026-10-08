'use client';

import { EmptyState, SeverityBadge, Skeleton, StateBadge, useCurrentTime } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { IncidentImpact } from '@/features/incidents/incident-impact';
import type { IncidentSummary } from '@/features/incidents/model';
import { incidentWarRoomHref } from '@/features/incidents/routes';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { NewUpdatesPill } from '@/lib/live/new-updates-pill';
import { useLiveUpdateBuffer } from '@/lib/live/use-live-update-buffer';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';
import { areaHref } from '@/shell/navigation/navigation-model';

const AGE_REFRESH_MS = 60_000;
const PLACEHOLDER_ROW_COUNT = 4;

const incidentReferenceOf = (incident: IncidentSummary) => incident.reference;

function ActiveIncidentsTable({
  workspaceSlug,
  incidents,
}: {
  workspaceSlug: string;
  incidents: IncidentSummary[];
}) {
  const translateActiveIncidents = useTranslations('commandCentre.activeIncidents');
  const translateStates = useTranslations('domain.incidentStates');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(AGE_REFRESH_MS);
  // Rows never move while someone reads them; new incidents wait behind the pill.
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-table">
          <thead>
            <tr className="border-b border-divider text-start text-meta text-fg-tertiary uppercase">
              <th scope="col" className="py-2 pe-4 text-start font-semibold">
                {translateActiveIncidents('columns.incident')}
              </th>
              <th scope="col" className="py-2 pe-4 text-start font-semibold">
                {translateActiveIncidents('columns.severity')}
              </th>
              <th scope="col" className="py-2 pe-4 text-start font-semibold">
                {translateActiveIncidents('columns.state')}
              </th>
              <th scope="col" className="py-2 pe-4 text-start font-semibold">
                {translateActiveIncidents('columns.impact')}
              </th>
              <th scope="col" className="py-2 text-end font-semibold">
                {translateActiveIncidents('columns.age')}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((incident) => (
              <tr key={incident.reference} className="border-b border-divider last:border-b-0">
                <td className="py-3 pe-4">
                  <span className="block font-mono text-meta text-fg-tertiary" dir="ltr">
                    {incident.reference}
                  </span>
                  <Link
                    href={incidentWarRoomHref(workspaceSlug, incident.reference)}
                    className="font-semibold text-fg-primary hover:underline"
                  >
                    {incident.title}
                  </Link>
                </td>
                <td className="py-3 pe-4">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td className="py-3 pe-4">
                  <StateBadge label={translateStates(incident.state)} />
                </td>
                <td className="py-3 pe-4">
                  <IncidentImpact impact={incident.impact} />
                </td>
                <td className="py-3 text-end text-fg-secondary tabular-nums">
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

export function ActiveIncidentsPanel({
  workspaceSlug,
  workspaceName,
  query,
}: {
  workspaceSlug: string;
  workspaceName: string;
  query: UseQueryResult<IncidentSummary[]>;
}) {
  const translateActiveIncidents = useTranslations('commandCentre.activeIncidents');

  return (
    <Panel
      title={translateActiveIncidents('heading')}
      action={
        <Link
          href={areaHref(workspaceSlug, 'incidents')}
          className="text-table font-semibold text-fg-secondary hover:text-fg-primary"
        >
          {translateActiveIncidents('viewAll')}
        </Link>
      }
    >
      <QuerySection
        query={query}
        sectionName={translateActiveIncidents('heading')}
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
              kind="all-clear"
              headingLevel={3}
              title={translateActiveIncidents('allClearTitle', { workspace: workspaceName })}
              description={translateActiveIncidents('allClearDescription')}
            />
          ) : (
            <ActiveIncidentsTable workspaceSlug={workspaceSlug} incidents={incidents} />
          )
        }
      </QuerySection>
    </Panel>
  );
}
