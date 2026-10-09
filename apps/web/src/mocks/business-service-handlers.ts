import { http, HttpResponse } from 'msw';

import {
  businessServiceDetailFor,
  businessServiceSummariesFor,
} from './fixtures/business-service-fixtures';
import { commandCentreFixturesFor } from './fixtures/command-centre-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for business services (ADR 0004). */

const businessServicesPath = '/api/v1/workspaces/:workspaceSlug/business-services';

export const businessServiceHandlers = [
  http.get(businessServicesPath, ({ request, params }) => {
    const workspaceSlug = String(params.workspaceSlug);
    // The Command Centre asks only for services that are not healthy.
    const items =
      new URL(request.url).searchParams.get('health') === 'not-healthy'
        ? (commandCentreFixturesFor(workspaceSlug)?.businessServicesAtRisk ?? [])
        : businessServiceSummariesFor(workspaceSlug);
    return HttpResponse.json({ items, nextCursor: null });
  }),

  http.get(`${businessServicesPath}/:businessServiceId`, ({ params }) => {
    const detail = businessServiceDetailFor(
      String(params.workspaceSlug),
      String(params.businessServiceId),
    );
    return detail === null
      ? HttpResponse.json(
          { title: 'Business service not found', status: 404, correlationId: 'RX-MOCK-404' },
          { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
        )
      : HttpResponse.json(detail);
  }),
];
