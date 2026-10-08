import { http, HttpResponse } from 'msw';

import {
  escalationChainFor,
  onCallScheduleDetailFor,
  onCallSchedulesFor,
} from './fixtures/on-call-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for On-call (ADR 0004). */

const onCallPath = '/api/v1/workspaces/:workspaceSlug/on-call';

function problem(status: 404, title: string) {
  return HttpResponse.json(
    { title, status, correlationId: `RX-MOCK-${status}` },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

export const onCallHandlers = [
  http.get(`${onCallPath}/schedules`, ({ params }) =>
    HttpResponse.json({
      items: onCallSchedulesFor(String(params.workspaceSlug)),
      nextCursor: null,
    }),
  ),

  http.get(`${onCallPath}/schedules/:scheduleId`, ({ params }) => {
    const detail = onCallScheduleDetailFor(String(params.workspaceSlug), String(params.scheduleId));
    return detail === null ? problem(404, 'Schedule not found') : HttpResponse.json(detail);
  }),

  http.get(`${onCallPath}/schedules/:scheduleId/escalation`, ({ params }) => {
    const chain = escalationChainFor(String(params.workspaceSlug), String(params.scheduleId));
    return chain === null ? problem(404, 'Schedule not found') : HttpResponse.json(chain);
  }),
];
