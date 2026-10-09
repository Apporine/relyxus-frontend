import { http, HttpResponse, ws } from 'msw';

import { adminHandlers } from './admin-handlers';
import { aiQualityHandlers } from './ai-quality-handlers';
import { approvalHandlers } from './approval-handlers';
import { businessServiceHandlers } from './business-service-handlers';
import { commandCentreHandlers } from './command-centre-handlers';
import { configurationHandlers } from './configuration-handlers';
import { evidenceHandlers } from './evidence-handlers';
import { governanceHandlers } from './governance-handlers';
import { incidentDeclarationHandlers } from './incident-declaration-handlers';
import { incidentListHandlers } from './incident-list-handlers';
import { onboardingProgressFixture } from './fixtures/onboarding-fixture';
import { platformStatusFixture } from './fixtures/platform-status-fixture';
import { sessionFixture } from './fixtures/session-fixture';
import { insightHandlers } from './insight-handlers';
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
  http.get('/api/v1/onboarding', () => HttpResponse.json(onboardingProgressFixture)),
  ...incidentListHandlers,
  ...incidentDeclarationHandlers,
  ...commandCentreHandlers,
  ...approvalHandlers,
  // Before the incident and policy handlers, whose :id routes would match these paths.
  ...governanceHandlers,
  // After the incident list handlers, so /incidents/summary is not read as an incident reference.
  ...evidenceHandlers,
  ...warRoomHandlers,
  ...onCallHandlers,
  ...serviceHandlers,
  ...businessServiceHandlers,
  ...aiQualityHandlers,
  ...insightHandlers,
  ...configurationHandlers,
  ...adminHandlers,
  // Accepts the live connection; capabilities publish their own fixture events through it.
  workspaceLiveUpdates.addEventListener('connection', () => undefined),
];
