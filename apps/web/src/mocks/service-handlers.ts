import { http, HttpResponse } from 'msw';

import {
  recordServiceConfirmation,
  serviceDependenciesFor,
  serviceDetailFor,
  serviceSummariesFor,
} from './fixtures/service-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for the service catalogue (ADR 0004). */

const servicesPath = '/api/v1/workspaces/:workspaceSlug/services';

function serviceNotFound() {
  return HttpResponse.json(
    { title: 'Service not found', status: 404, correlationId: 'RX-MOCK-404' },
    { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

export const serviceHandlers = [
  http.get(servicesPath, ({ request, params }) => {
    const searchText = new URL(request.url).searchParams.get('search') ?? '';
    return HttpResponse.json({
      items: serviceSummariesFor(String(params.workspaceSlug), searchText),
      nextCursor: null,
    });
  }),

  http.get(`${servicesPath}/:serviceId`, ({ params }) => {
    const detail = serviceDetailFor(String(params.workspaceSlug), String(params.serviceId));
    return detail === null ? serviceNotFound() : HttpResponse.json(detail);
  }),

  http.get(`${servicesPath}/:serviceId/dependencies`, ({ params }) => {
    const dependencies = serviceDependenciesFor(
      String(params.workspaceSlug),
      String(params.serviceId),
    );
    return dependencies === null ? serviceNotFound() : HttpResponse.json(dependencies);
  }),

  http.post(`${servicesPath}/:serviceId/confirmation`, ({ params }) => {
    const serviceId = String(params.serviceId);
    return recordServiceConfirmation(String(params.workspaceSlug), serviceId)
      ? HttpResponse.json({ serviceId, discovery: 'confirmed' })
      : serviceNotFound();
  }),
];
