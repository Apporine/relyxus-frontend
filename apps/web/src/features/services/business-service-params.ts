import type { Route } from 'next';

import { areaHref } from '@/shell/navigation/navigation-model';

const BUSINESS_SERVICE_PARAMETER = 'service';

export function selectedBusinessServiceIdFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): string | null {
  const businessServiceId = searchParams.get(BUSINESS_SERVICE_PARAMETER);
  return businessServiceId === null || businessServiceId === '' ? null : businessServiceId;
}

/** Business services and tolerances (UI/UX s. 12.5), optionally with one service selected. */
export function businessServicesHref(
  workspaceSlug: string,
  businessServiceId: string | null = null,
): Route {
  const base = `${areaHref(workspaceSlug, 'services')}/business`;
  return (
    businessServiceId === null
      ? base
      : `${base}?${BUSINESS_SERVICE_PARAMETER}=${encodeURIComponent(businessServiceId)}`
  ) as Route;
}
