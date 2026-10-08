'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import {
  approvalDecisionResponseSchema,
  approvalDetailSchema,
  pendingApprovalListSchema,
  type ApprovalDecisionRequest,
} from './model';

export const pendingApprovalEvents = [
  'approval.requested.v1',
  'approval.decided.v1',
  'approval.expired.v1',
] as const;

export const approvalQueryKeys = {
  all: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'approvals'] as const,
  waitingForMe: (workspaceSlug: string) =>
    [...approvalQueryKeys.all(workspaceSlug), 'waiting-for-me'] as const,
  waitingForOthers: (workspaceSlug: string) =>
    [...approvalQueryKeys.all(workspaceSlug), 'waiting-for-others'] as const,
  detail: (workspaceSlug: string, approvalId: string) =>
    [...approvalQueryKeys.all(workspaceSlug), 'detail', approvalId] as const,
};

function approvalsPath(workspaceSlug: string): string {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}/approvals`;
}

function usePendingApprovals(workspaceSlug: string, assignee: 'me' | 'others') {
  return useQuery({
    queryKey:
      assignee === 'me'
        ? approvalQueryKeys.waitingForMe(workspaceSlug)
        : approvalQueryKeys.waitingForOthers(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: approvalsPath(workspaceSlug),
          query: { status: 'pending', assignee, sort: 'expires-at' },
          responseSchema: pendingApprovalListSchema,
          signal,
        })
      ).data.items,
  });
}

/** Approvals the signed-in person may decide, soonest expiry first. */
export function usePendingApprovalsForMe(workspaceSlug: string) {
  return usePendingApprovals(workspaceSlug, 'me');
}

/** Pending approvals that wait on other approvers; visible but not actionable here. */
export function usePendingApprovalsForOthers(workspaceSlug: string) {
  return usePendingApprovals(workspaceSlug, 'others');
}

export function useApprovalDetail(workspaceSlug: string, approvalId: string | null) {
  return useQuery({
    queryKey: approvalQueryKeys.detail(workspaceSlug, approvalId ?? ''),
    enabled: approvalId !== null,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${approvalsPath(workspaceSlug)}/${encodeURIComponent(approvalId ?? '')}`,
          responseSchema: approvalDetailSchema,
          signal,
        })
      ).data,
  });
}

export type ApprovalDecisionSubmission = {
  decision: ApprovalDecisionRequest;
  /**
   * Created once per decision intent (when its confirmation opens), so a retried submission
   * can never count twice, while a new decision never reuses an earlier key.
   */
  idempotencyKey: string;
};

/** Records a decision; the server revalidates eligibility, expiry, quorum and policy. */
export function useDecideApproval(workspaceSlug: string, approvalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ decision, idempotencyKey }: ApprovalDecisionSubmission) =>
      (
        await requestApi({
          method: 'POST',
          path: `${approvalsPath(workspaceSlug)}/${encodeURIComponent(approvalId)}/decisions`,
          body: decision,
          idempotencyKey,
          responseSchema: approvalDecisionResponseSchema,
        })
      ).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: approvalQueryKeys.all(workspaceSlug) }),
  });
}
