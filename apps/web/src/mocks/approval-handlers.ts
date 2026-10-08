import { http, HttpResponse } from 'msw';

import { approvalDecisionRequestSchema } from '@/features/approvals/model';

import {
  approvalDetailFor,
  pendingApprovalsFor,
  recordApprovalDecision,
  RESTRICTED_DEMO_APPROVAL_ID,
} from './fixtures/approval-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for the Approvals inbox (ADR 0004). */

const approvalsPath = '/api/v1/workspaces/:workspaceSlug/approvals';

/** A retried decision with the same Idempotency-Key gets the first answer and counts once. */
const decisionResponsesByIdempotencyKey = new Map<string, Response>();

function problem(status: 400 | 403 | 404 | 409, title: string) {
  return HttpResponse.json(
    { title, status, correlationId: `RX-MOCK-${status}` },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

export const approvalHandlers = [
  http.get(approvalsPath, ({ request, params }) => {
    const url = new URL(request.url);
    const assignee = url.searchParams.get('assignee');
    if (
      url.searchParams.get('status') !== 'pending' ||
      (assignee !== 'me' && assignee !== 'others')
    ) {
      return HttpResponse.json({ items: [], nextCursor: null });
    }
    return HttpResponse.json({
      items: pendingApprovalsFor(String(params.workspaceSlug), assignee),
      nextCursor: null,
    });
  }),

  http.get(`${approvalsPath}/:approvalId`, ({ params }) => {
    const approvalId = String(params.approvalId);
    if (approvalId === RESTRICTED_DEMO_APPROVAL_ID) {
      return problem(403, 'Restricted approval');
    }
    const detail = approvalDetailFor(String(params.workspaceSlug), approvalId);
    return detail === null ? problem(404, 'Approval not found') : HttpResponse.json(detail);
  }),

  http.post(`${approvalsPath}/:approvalId/decisions`, async ({ request, params }) => {
    const idempotencyKey = request.headers.get('Idempotency-Key');
    const earlierResponse =
      idempotencyKey === null ? undefined : decisionResponsesByIdempotencyKey.get(idempotencyKey);
    if (earlierResponse !== undefined) {
      return earlierResponse.clone();
    }
    const response = await decide(request, params);
    if (idempotencyKey !== null) {
      decisionResponsesByIdempotencyKey.set(idempotencyKey, response.clone());
    }
    return response;
  }),
];

async function decide(
  request: Request,
  params: Record<string, string | readonly string[] | undefined>,
): Promise<Response> {
  const decision = approvalDecisionRequestSchema.safeParse(await request.json());
  if (!decision.success) {
    return problem(400, 'A rejection needs a reason');
  }
  const recorded = recordApprovalDecision(
    String(params.workspaceSlug),
    String(params.approvalId),
    decision.data,
  );
  if (recorded === null) {
    return problem(404, 'Approval not found');
  }
  return recorded.status === 'refused'
    ? problem(409, recorded.title)
    : HttpResponse.json(recorded.response);
}
