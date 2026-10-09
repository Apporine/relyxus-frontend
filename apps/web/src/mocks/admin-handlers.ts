import { http, HttpResponse } from 'msw';

import { collectionHandlers } from './collection-handlers';
import {
  platformOperationsFixture,
  promotionFixtures,
  securitySectionFixtures,
  statusPageFixtures,
  supportSessionFixtures,
  userFixtures,
} from './fixtures/admin-fixtures';
import {
  isRequestableTrustDocument,
  managedTrustDocuments,
  publicTrustDocuments,
} from './fixtures/trust-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for status pages and administration. */

export const adminHandlers = [
  ...collectionHandlers('settings/status-pages', statusPageFixtures, (statusPage) => ({
    id: statusPage.id,
    name: statusPage.name,
    audience: statusPage.audience,
    activeIncidentCount: statusPage.activeIncidentCount,
  })),
  ...collectionHandlers(
    'settings/promotions',
    () => promotionFixtures,
    ({ id, sourceName, targetName }) => ({ id, sourceName, targetName }),
  ),
  ...collectionHandlers(
    'settings/support-sessions',
    supportSessionFixtures,
    ({ id, reference, state, expiresAt }) => ({ id, reference, state, expiresAt }),
  ),
  ...collectionHandlers(
    'settings/users',
    () => userFixtures,
    ({ id, name, status, primaryTeamName }) => ({ id, name, status, primaryTeamName }),
  ),
  ...collectionHandlers(
    'settings/security',
    () => securitySectionFixtures,
    ({ id, summary }) => ({ id, summary }),
  ),
  http.get('/api/v1/workspaces/:workspaceSlug/settings/platform', ({ params }) =>
    params.workspaceSlug === 'payments-uk'
      ? HttpResponse.json(platformOperationsFixture())
      : HttpResponse.json(
          { title: 'Not found', status: 404, correlationId: 'RX-MOCK-404' },
          { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
        ),
  ),
  http.get('/api/v1/workspaces/:workspaceSlug/settings/trust-documents', () =>
    HttpResponse.json({ items: managedTrustDocuments(), nextCursor: null }),
  ),
  http.get('/api/v1/trust/documents', () =>
    HttpResponse.json({ items: publicTrustDocuments(), nextCursor: null }),
  ),
  http.post('/api/v1/trust/documents/:documentId/access-requests', ({ params }) =>
    isRequestableTrustDocument(String(params.documentId))
      ? HttpResponse.json({ requestId: `access-${String(params.documentId)}` }, { status: 201 })
      : HttpResponse.json(
          { title: 'Not found', status: 404, correlationId: 'RX-MOCK-404' },
          { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
        ),
  ),
];
