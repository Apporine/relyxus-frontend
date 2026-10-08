'use client';

import { Button } from '@relyxus/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { IncidentListFilters } from './incident-list-filters';
import { incidentListFiltersFromSearchParams } from './incident-list-params';
import { IncidentListTable } from './incident-list-table';
import { IncidentSummaryMetrics } from './incident-summary-metrics';
import { incidentListEvents, incidentQueryKeys, useIncidents, useIncidentListSummary } from './queries';
import { declareIncidentHref } from './routes';

/** Incident List (UI/UX s. 10.2): summary metrics, filters and the full incident table. */
export function IncidentListPage() {
  const translateList = useTranslations('incidents.list');
  const searchParams = useSearchParams();
  const { workspace } = useCurrentWorkspace();
  const filters = incidentListFiltersFromSearchParams(searchParams);

  const incidentsQuery = useIncidents(workspace.slug, filters);
  const summaryQuery = useIncidentListSummary(workspace.slug);

  useRefreshOnLiveEvents(incidentListEvents, incidentQueryKeys.list(workspace.slug, filters));
  useRefreshOnLiveEvents(incidentListEvents, incidentQueryKeys.summary(workspace.slug));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateList('title')}
        description={translateList('description')}
        actions={
          <Button asChild variant="primary">
            <Link href={declareIncidentHref(workspace.slug)}>
              {translateList('declareIncident')}
            </Link>
          </Button>
        }
      />

      <IncidentSummaryMetrics query={summaryQuery} />
      <IncidentListFilters workspaceSlug={workspace.slug} filters={filters} />
      <IncidentListTable
        workspaceSlug={workspace.slug}
        workspaceName={workspace.name}
        query={incidentsQuery}
      />
    </div>
  );
}
