import { http, HttpResponse } from 'msw';

import { severityLevels, type SeverityLevel } from '@relyxus/ui';

import {
  filterIncidentRecords,
  incidentListSummaryFor,
  incidentRecordsFor,
  type IncidentListQuery,
} from './fixtures/incident-fixtures';
import { emptyListResponse } from './fixtures/command-centre-fixtures';

function parseIncidentListQuery(url: URL): IncidentListQuery {
  const statusParam = url.searchParams.get('status');
  const status =
    statusParam === 'resolved' || statusParam === 'all' ? statusParam : 'active';

  const severities = url.searchParams
    .getAll('severity')
    .filter((value): value is SeverityLevel =>
      (severityLevels as readonly string[]).includes(value),
    );

  const businessServiceId = url.searchParams.get('businessServiceId');
  const sortParam = url.searchParams.get('sort');
  const sort = sortParam === 'declared-at' ? 'declared-at' : 'severity';

  return {
    status,
    severities,
    businessServiceId: businessServiceId === null || businessServiceId === '' ? null : businessServiceId,
    sort,
  };
}

/** Mock Service Worker handlers for the Incident List endpoints (development only). */
export const incidentListHandlers = [
  http.get('/api/v1/workspaces/:workspaceSlug/incidents/summary', ({ params }) => {
    const summary = incidentListSummaryFor(String(params.workspaceSlug));
    if (summary === null) {
      return HttpResponse.json({
        activeBySeverity: { SEV1: 0, SEV2: 0, SEV3: 0, SEV4: 0 },
        activeInvestigatingCount: 0,
        activeMonitoringCount: 0,
        resolvedLast24Hours: 0,
      });
    }
    return HttpResponse.json(summary);
  }),

  http.get('/api/v1/workspaces/:workspaceSlug/incidents', ({ request, params }) => {
    const url = new URL(request.url);
    const records = incidentRecordsFor(String(params.workspaceSlug));
    if (records === null) {
      return HttpResponse.json(emptyListResponse());
    }

    const items = filterIncidentRecords(records, parseIncidentListQuery(url));
    return HttpResponse.json({ items, nextCursor: null });
  }),
];
