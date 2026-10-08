import type { Route } from 'next';
import type { ReadonlyURLSearchParams } from 'next/navigation';

import { severityLevels, type SeverityLevel } from '@relyxus/ui';

import type { IncidentViewStatus } from './model';
import { areaHref } from '@/shell/navigation/navigation-model';

export type IncidentListFilters = {
  status: IncidentViewStatus;
  severities: readonly SeverityLevel[];
  businessServiceId: string | null;
};

const defaultFilters: IncidentListFilters = {
  status: 'active',
  severities: [],
  businessServiceId: null,
};

function parseSeverityValues(rawValues: string[]): SeverityLevel[] {
  return rawValues.filter((value): value is SeverityLevel =>
    (severityLevels as readonly string[]).includes(value),
  );
}

/** Reads filter state from the URL so incident lists are shareable (UI/UX s. 10.2). */
export function incidentListFiltersFromSearchParams(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
): IncidentListFilters {
  const statusParam = searchParams.get('status');
  const status =
    statusParam === 'resolved' || statusParam === 'all' ? statusParam : defaultFilters.status;

  const severities = parseSeverityValues(searchParams.getAll('severity'));
  const businessServiceId = searchParams.get('service');

  return {
    status,
    severities,
    businessServiceId:
      businessServiceId === null || businessServiceId === '' ? null : businessServiceId,
  };
}

export function incidentListSearchParams(filters: IncidentListFilters): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (filters.status !== defaultFilters.status) {
    searchParams.set('status', filters.status);
  }
  for (const severity of filters.severities) {
    searchParams.append('severity', severity);
  }
  if (filters.businessServiceId !== null) {
    searchParams.set('service', filters.businessServiceId);
  }
  return searchParams;
}

export function incidentListHref(workspaceSlug: string, filters: IncidentListFilters): Route {
  const searchParams = incidentListSearchParams(filters);
  const query = searchParams.toString();
  const basePath = areaHref(workspaceSlug, 'incidents');
  return (query === '' ? basePath : `${basePath}?${query}`) as Route;
}
