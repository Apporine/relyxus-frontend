'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import { pendingApprovalListSchema } from './model';

export const pendingApprovalEvents = [
  'approval.requested.v1',
  'approval.decided.v1',
  'approval.expired.v1',
] as const;

export const approvalQueryKeys = {
  waitingForMe: (workspaceSlug: string) =>
    ['workspaces', workspaceSlug, 'approvals', 'waiting-for-me'] as const,
};

/** Approvals the signed-in person may decide, soonest expiry first. */
export function usePendingApprovalsForMe(workspaceSlug: string) {
  return useQuery({
    queryKey: approvalQueryKeys.waitingForMe(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/approvals`,
          query: { status: 'pending', assignee: 'me', sort: 'expires-at' },
          responseSchema: pendingApprovalListSchema,
          signal,
        })
      ).data.items,
  });
}
