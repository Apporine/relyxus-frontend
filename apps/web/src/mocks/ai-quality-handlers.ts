import { http, HttpResponse } from 'msw';

import {
  modelRoutesFor,
  replayRunDetailFor,
  replayRunsFor,
  scorecardFor,
} from './fixtures/ai-quality-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for Replay and AI quality (ADR 0004). */

const workspacePath = '/api/v1/workspaces/:workspaceSlug';

function notFound(title: string) {
  return HttpResponse.json(
    { title, status: 404, correlationId: 'RX-MOCK-404' },
    { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

export const aiQualityHandlers = [
  http.get(`${workspacePath}/ai-quality/scorecard`, ({ params }) => {
    const scorecard = scorecardFor(String(params.workspaceSlug));
    return scorecard === null ? notFound('Scorecard not found') : HttpResponse.json(scorecard);
  }),

  http.get(`${workspacePath}/ai-quality/model-routes`, ({ params }) =>
    HttpResponse.json({ items: modelRoutesFor(String(params.workspaceSlug)), nextCursor: null }),
  ),

  http.get(`${workspacePath}/replay-runs`, ({ params }) =>
    HttpResponse.json({ items: replayRunsFor(String(params.workspaceSlug)), nextCursor: null }),
  ),

  http.get(`${workspacePath}/replay-runs/:runId`, ({ params }) => {
    const run = replayRunDetailFor(String(params.workspaceSlug), String(params.runId));
    return run === null ? notFound('Replay run not found') : HttpResponse.json(run);
  }),
];
