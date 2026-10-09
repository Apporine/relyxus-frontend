import type { Route } from 'next';

import { areaHref } from '@/shell/navigation/navigation-model';

/** Opens the Approvals inbox with one request selected; the selection lives in the URL. */
export function approvalHref(workspaceSlug: string, approvalId: string): Route {
  return `${areaHref(workspaceSlug, 'approvals')}?approval=${encodeURIComponent(approvalId)}` as Route;
}

/** One approval on its own page: the phone layout, and the target of push notifications. */
export function approvalPageHref(workspaceSlug: string, approvalId: string): Route {
  return `${areaHref(workspaceSlug, 'approvals')}/${encodeURIComponent(approvalId)}` as Route;
}
