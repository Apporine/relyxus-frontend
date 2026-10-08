import { http, HttpResponse } from 'msw';

import { commandCentreFixturesFor, emptyListResponse } from './fixtures/command-centre-fixtures';

/** Mock Service Worker handlers for the Command Centre endpoints (development only). */
export const commandCentreHandlers = [
  http.get('/api/v1/workspaces/:workspaceSlug/incidents', ({ request, params }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('status') !== 'active') {
      return HttpResponse.json(emptyListResponse());
    }
    const fixtures = commandCentreFixturesFor(String(params.workspaceSlug));
    return HttpResponse.json({
      items: fixtures?.activeIncidents ?? [],
      nextCursor: null,
    });
  }),

  http.get('/api/v1/workspaces/:workspaceSlug/approvals', ({ request, params }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('status') !== 'pending' || url.searchParams.get('assignee') !== 'me') {
      return HttpResponse.json(emptyListResponse());
    }
    const fixtures = commandCentreFixturesFor(String(params.workspaceSlug));
    return HttpResponse.json({
      items: fixtures?.pendingApprovals ?? [],
      nextCursor: null,
    });
  }),

  http.get('/api/v1/workspaces/:workspaceSlug/regulator-clocks', ({ request, params }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('status') !== 'active') {
      return HttpResponse.json(emptyListResponse());
    }
    const fixtures = commandCentreFixturesFor(String(params.workspaceSlug));
    return HttpResponse.json({
      items: fixtures?.regulatorClocks ?? [],
      nextCursor: null,
    });
  }),

  http.get('/api/v1/workspaces/:workspaceSlug/business-services', ({ request, params }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('health') !== 'not-healthy') {
      return HttpResponse.json(emptyListResponse());
    }
    const fixtures = commandCentreFixturesFor(String(params.workspaceSlug));
    return HttpResponse.json({
      items: fixtures?.businessServicesAtRisk ?? [],
      nextCursor: null,
    });
  }),

  http.get('/api/v1/workspaces/:workspaceSlug/connectors', ({ params }) => {
    const fixtures = commandCentreFixturesFor(String(params.workspaceSlug));
    return HttpResponse.json({
      items: fixtures?.connectors ?? [],
      nextCursor: null,
    });
  }),

  http.get('/api/v1/workspaces/:workspaceSlug/metrics/last-24-hours', ({ params }) => {
    const fixtures = commandCentreFixturesFor(String(params.workspaceSlug));
    if (fixtures === null) {
      return HttpResponse.json(
        {
          incidentCount: 0,
          medianTimeToFirstHypothesisSeconds: null,
          resolvedWithoutRollbackCount: 0,
          unapprovedProductionChangeCount: 0,
        },
        { status: 200 },
      );
    }
    return HttpResponse.json(fixtures.lastDaySummary);
  }),
];
