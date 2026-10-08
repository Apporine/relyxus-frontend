import type { Route } from 'next';

import { areaHref } from '@/shell/navigation/navigation-model';

/** Opens the Approvals inbox with one request selected; the selection lives in the URL. */
export function approvalHref(workspaceSlug: string, approvalId: string): Route {
  return `${areaHref(workspaceSlug, 'approvals')}?approval=${encodeURIComponent(approvalId)}` as Route;
}
