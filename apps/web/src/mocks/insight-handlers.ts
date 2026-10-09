import { http, HttpResponse } from 'msw';

import { reliabilityAnalyticsFor } from './fixtures/analytics-fixtures';
import { auditLogPageFor } from './fixtures/audit-fixtures';
import { complianceOverviewFor } from './fixtures/compliance-fixtures';
import { connectedSystemsFor, connectorCatalogueFor } from './fixtures/integration-fixtures';

/*
 * DEVELOPMENT ONLY. Mock Service Worker handlers for Analytics, Audit, Integrations and the
 * Compliance Centre (ADR 0004).
 */

const workspacePath = '/api/v1/workspaces/:workspaceSlug';

function notFound(title: string) {
  return HttpResponse.json(
    { title, status: 404, correlationId: 'RX-MOCK-404' },
    { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

export const insightHandlers = [
  http.get(`${workspacePath}/analytics/reliability`, ({ params }) => {
    const analytics = reliabilityAnalyticsFor(String(params.workspaceSlug));
    return analytics === null ? notFound('Analytics not found') : HttpResponse.json(analytics);
  }),

  http.get(`${workspacePath}/audit-events`, ({ request, params }) =>
    HttpResponse.json(
      auditLogPageFor(
        String(params.workspaceSlug),
        new URL(request.url).searchParams.get('category'),
      ),
    ),
  ),

  http.get(`${workspacePath}/integrations/connected`, ({ params }) =>
    HttpResponse.json({
      items: connectedSystemsFor(String(params.workspaceSlug)),
      nextCursor: null,
    }),
  ),

  http.get(`${workspacePath}/integrations/catalogue`, ({ params }) =>
    HttpResponse.json({
      items: connectorCatalogueFor(String(params.workspaceSlug)),
      nextCursor: null,
    }),
  ),

  http.get(`${workspacePath}/compliance/overview`, ({ params }) => {
    const overview = complianceOverviewFor(String(params.workspaceSlug));
    return overview === null
      ? notFound('Compliance overview not found')
      : HttpResponse.json(overview);
  }),
];
