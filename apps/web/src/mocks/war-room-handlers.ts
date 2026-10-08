import { http, HttpResponse, type JsonBodyType } from 'msw';

import { sessionFixture } from './fixtures/session-fixture';
import {
  recordAcknowledgement,
  RESTRICTED_DEMO_INCIDENT_REFERENCE,
  warRoomFixtureFor,
  type WarRoomFixture,
} from './fixtures/war-room-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for the war room (ADR 0004). */

const incidentPath = '/api/v1/workspaces/:workspaceSlug/incidents/:incidentReference';

function problem(status: 403 | 404, title: string) {
  return HttpResponse.json(
    { title, status, correlationId: `RX-MOCK-${status}` },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

/** Resolves the fixture, answering 403 for the restricted demo incident and 404 for unknown ones. */
function respondWithSection(
  params: Record<string, string | readonly string[] | undefined>,
  selectSection: (fixture: WarRoomFixture) => JsonBodyType,
) {
  const reference = String(params.incidentReference);
  if (reference === RESTRICTED_DEMO_INCIDENT_REFERENCE) {
    return problem(403, 'Restricted incident');
  }
  const fixture = warRoomFixtureFor(String(params.workspaceSlug), reference);
  return fixture === null
    ? problem(404, 'Incident not found')
    : HttpResponse.json(selectSection(fixture));
}

function list<Item>(items: Item[]) {
  return { items, nextCursor: null };
}

export const warRoomHandlers = [
  http.get(incidentPath, ({ params }) => respondWithSection(params, (fixture) => fixture.incident)),
  http.get(`${incidentPath}/investigation`, ({ params }) =>
    respondWithSection(params, (fixture) => fixture.investigation),
  ),
  http.get(`${incidentPath}/actions`, ({ params }) =>
    respondWithSection(params, (fixture) => list(fixture.actions)),
  ),
  http.get(`${incidentPath}/clocks`, ({ params }) =>
    respondWithSection(params, (fixture) => list(fixture.clocks)),
  ),
  http.get(`${incidentPath}/communications`, ({ params }) =>
    respondWithSection(params, (fixture) => fixture.communications),
  ),
  http.get(`${incidentPath}/timeline`, ({ params }) =>
    respondWithSection(params, (fixture) => list(fixture.timeline)),
  ),
  http.get(`${incidentPath}/tasks`, ({ params }) =>
    respondWithSection(params, (fixture) => list(fixture.tasks)),
  ),
  http.post(`${incidentPath}/acknowledgements`, ({ params }) =>
    respondWithSection(params, (fixture) =>
      recordAcknowledgement(fixture.incident.reference, sessionFixture.user.displayName),
    ),
  ),
];
