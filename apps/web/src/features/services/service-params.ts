import type { Route } from 'next';

import { areaHref } from '@/shell/navigation/navigation-model';

/** Service detail tabs in the order of UI/UX s. 13.2. */
export const serviceDetailTabs = [
  'overview',
  'dependencies',
  'slos',
  'incidents',
  'changes',
  'policies',
  'owners',
  'vendors-and-regions',
  'history',
] as const;
export type ServiceDetailTab = (typeof serviceDetailTabs)[number];

export const SERVICE_PARAMETER = 'service';
export const SERVICE_TAB_PARAMETER = 'tab';
export const SERVICE_SEARCH_PARAMETER = 'q';

export function selectedServiceIdFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): string | null {
  const serviceId = searchParams.get(SERVICE_PARAMETER);
  return serviceId === null || serviceId === '' ? null : serviceId;
}

export function serviceSearchTextFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): string {
  return searchParams.get(SERVICE_SEARCH_PARAMETER)?.trim() ?? '';
}

type ServicesViewOptions = {
  serviceId?: string | null;
  tab?: ServiceDetailTab;
  searchText?: string;
};

/**
 * Opens the service catalogue. The selected service, its tab and the search live in the URL,
 * so a link from an incident reopens exactly that view.
 */
export function servicesHref(
  workspaceSlug: string,
  { serviceId = null, tab = 'overview', searchText = '' }: ServicesViewOptions = {},
): Route {
  const searchParams = new URLSearchParams();
  if (searchText !== '') {
    searchParams.set(SERVICE_SEARCH_PARAMETER, searchText);
  }
  if (serviceId !== null) {
    searchParams.set(SERVICE_PARAMETER, serviceId);
  }
  if (tab !== 'overview') {
    searchParams.set(SERVICE_TAB_PARAMETER, tab);
  }
  const queryString = searchParams.toString();
  const base = areaHref(workspaceSlug, 'services');
  return (queryString === '' ? base : `${base}?${queryString}`) as Route;
}

/** The war room links each affected service straight to its dependency evidence. */
export function serviceDependenciesHref(workspaceSlug: string, serviceId: string): Route {
  return servicesHref(workspaceSlug, { serviceId, tab: 'dependencies' });
}
