import type { Route } from 'next';

import { areaHref } from '@/shell/navigation/navigation-model';

import { approvalHref } from './routes';

export function selectedApprovalIdFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): string | null {
  const approval = searchParams.get('approval');
  return approval === null || approval === '' ? null : approval;
}

/** Opens the Approvals inbox, optionally with one request selected in the URL. */
export function approvalsInboxHref(workspaceSlug: string, approvalId: string | null = null): Route {
  if (approvalId === null) {
    return areaHref(workspaceSlug, 'approvals');
  }
  return approvalHref(workspaceSlug, approvalId);
}
