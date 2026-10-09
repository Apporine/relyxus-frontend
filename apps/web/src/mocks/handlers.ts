import { http, HttpResponse, ws } from 'msw';

import { approvalHandlers } from './approval-handlers';
import { commandCentreHandlers } from './command-centre-handlers';
import { evidenceHandlers } from './evidence-handlers';
import { incidentDeclarationHandlers } from './incident-declaration-handlers';
import { incidentListHandlers } from './incident-list-handlers';
import { platformStatusFixture } from './fixtures/platform-status-fixture';
import { sessionFixture } from './fixtures/session-fixture';
import { onCallHandlers } from './on-call-handlers';
import { serviceHandlers } from './service-handlers';
import { warRoomHandlers } from './war-room-handlers';

/*
 * Mock API handlers for the provisional contract (ADR 0004). Loaded by Mock Service Worker
 * in development and on demo hosts where NEXT_PUBLIC_RELYXUS_API_MOCKING=enabled.
 */

const workspaceLiveUpdates = ws.link(/\/api\/v1\/workspaces\/[^/]+\/live$/);

export const handlers = [
  http.get('/api/v1/me', () => HttpResponse.json(sessionFixture)),
  http.get('/api/v1/platform/status', () => HttpResponse.json(platformStatusFixture)),
  ...incidentListHandlers,
  ...incidentDeclarationHandlers,
  ...commandCentreHandlers,
  ...approvalHandlers,
  // After the incident list handlers, so /incidents/summary is not read as an incident reference.
  ...evidenceHandlers,
  ...warRoomHandlers,
  ...onCallHandlers,
  ...serviceHandlers,
  // Accepts the live connection; capabilities publish their own fixture events through it.
  workspaceLiveUpdates.addEventListener('connection', () => undefined),
];
