import { http, HttpResponse, ws } from 'msw';

import { commandCentreHandlers } from './command-centre-handlers';
import { incidentDeclarationHandlers } from './incident-declaration-handlers';
import { incidentListHandlers } from './incident-list-handlers';
import { platformStatusFixture } from './fixtures/platform-status-fixture';
import { sessionFixture } from './fixtures/session-fixture';

/*
 * DEVELOPMENT ONLY. Request handlers for the provisional API contract (ADR 0004). Each
 * capability adds the handlers for the endpoints its screens use.
 */

const workspaceLiveUpdates = ws.link(/\/api\/v1\/workspaces\/[^/]+\/live$/);

export const handlers = [
  http.get('/api/v1/me', () => HttpResponse.json(sessionFixture)),
  http.get('/api/v1/platform/status', () => HttpResponse.json(platformStatusFixture)),
  ...incidentListHandlers,
  ...incidentDeclarationHandlers,
  ...commandCentreHandlers,
  // Accepts the live connection; capabilities publish their own fixture events through it.
  workspaceLiveUpdates.addEventListener('connection', () => undefined),
];
