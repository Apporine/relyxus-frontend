import { http, HttpResponse } from 'msw';

import {
  matchesEvidenceFilters,
  type EvidenceFreshnessFilter,
  type EvidenceListFilters,
} from '@/features/evidence/model';

import {
  evidenceDetailFor,
  evidenceSourcesFor,
  evidenceSummariesFor,
} from './fixtures/evidence-fixtures';
import { RESTRICTED_DEMO_INCIDENT_REFERENCE } from './fixtures/war-room-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for the Evidence Explorer (ADR 0004). */

const evidenceCollectionPath =
  '/api/v1/workspaces/:workspaceSlug/incidents/:incidentReference/evidence';
const evidenceItemPath = `${evidenceCollectionPath}/:evidenceId`;

function problem(status: 403 | 404, title: string) {
  return HttpResponse.json(
    { title, status, correlationId: `RX-MOCK-${status}` },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

function parseEvidenceFilters(url: URL): EvidenceListFilters {
  const sourceParam = url.searchParams.get('source');
  const hypothesisParam = url.searchParams.get('hypothesis');
  const freshnessParam = url.searchParams.get('freshness');
  const freshness: EvidenceFreshnessFilter =
    freshnessParam === 'fresh' || freshnessParam === 'stale' ? freshnessParam : 'all';

  return {
    source: sourceParam === null || sourceParam === '' ? null : sourceParam,
    hypothesisId: hypothesisParam === null || hypothesisParam === '' ? null : hypothesisParam,
    freshness,
  };
}

function guardIncident(
  params: Record<string, string | readonly string[] | undefined>,
): Response | null {
  const reference = String(params.incidentReference);
  if (reference === RESTRICTED_DEMO_INCIDENT_REFERENCE) {
    return problem(403, 'Restricted incident');
  }
  if (evidenceSummariesFor(String(params.workspaceSlug), reference) === null) {
    return problem(404, 'Incident not found');
  }
  return null;
}

export const evidenceHandlers = [
  http.get(evidenceCollectionPath, ({ request, params }) => {
    const blocked = guardIncident(params);
    if (blocked !== null) {
      return blocked;
    }
    const summaries =
      evidenceSummariesFor(String(params.workspaceSlug), String(params.incidentReference)) ?? [];
    const filters = parseEvidenceFilters(new URL(request.url));
    const items = summaries.filter((item) => matchesEvidenceFilters(item, filters));
    return HttpResponse.json({ items, nextCursor: null });
  }),

  http.get(`${evidenceCollectionPath}/sources`, ({ params }) => {
    const blocked = guardIncident(params);
    if (blocked !== null) {
      return blocked;
    }
    const items = evidenceSourcesFor(
      String(params.workspaceSlug),
      String(params.incidentReference),
    );
    return HttpResponse.json({ items });
  }),

  http.get(evidenceItemPath, ({ params }) => {
    const blocked = guardIncident(params);
    if (blocked !== null) {
      return blocked;
    }
    const detail = evidenceDetailFor(
      String(params.workspaceSlug),
      String(params.incidentReference),
      String(params.evidenceId),
    );
    return detail === null ? problem(404, 'Evidence not found') : HttpResponse.json(detail);
  }),
];
