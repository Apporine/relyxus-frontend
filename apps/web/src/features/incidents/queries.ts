'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import type { IncidentListFilters } from './incident-list-params';
import { incidentListSummarySchema, incidentSummaryListSchema } from './model';

/** Live events after which incident lists are re-read (provisional names, ADR 0004). */
export const incidentListEvents = [
  'incident.declared.v1',
  'incident.updated.v1',
  'incident.resolved.v1',
] as const;

export const incidentQueryKeys = {
  active: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'incidents', 'active'] as const,
  list: (workspaceSlug: string, filters: IncidentListFilters) =>
    ['workspaces', workspaceSlug, 'incidents', 'list', filters] as const,
  summary: (workspaceSlug: string) =>
    ['workspaces', workspaceSlug, 'incidents', 'summary'] as const,
};

function listQueryParameters(
  filters: IncidentListFilters,
): Record<string, string | readonly string[]> {
  const sort = filters.status === 'active' ? 'severity' : 'declared-at';
  return {
    status: filters.status,
    sort,
    ...(filters.severities.length > 0 ? { severity: filters.severities } : {}),
    ...(filters.businessServiceId === null ? {} : { businessServiceId: filters.businessServiceId }),
  };
}

/** Incidents matching the list filters. */
export function useIncidents(workspaceSlug: string, filters: IncidentListFilters) {
  return useQuery({
    queryKey: incidentQueryKeys.list(workspaceSlug, filters),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/incidents`,
          query: listQueryParameters(filters),
          responseSchema: incidentSummaryListSchema,
          signal,
        })
      ).data.items,
  });
}

/** Open incidents ordered by severity, then by how long they have been running. */
export function useActiveIncidents(workspaceSlug: string) {
  return useIncidents(workspaceSlug, { status: 'active', severities: [], businessServiceId: null });
}

/** Header metrics for the Incident List screen. */
export function useIncidentListSummary(workspaceSlug: string) {
  return useQuery({
    queryKey: incidentQueryKeys.summary(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/incidents/summary`,
          responseSchema: incidentListSummarySchema,
          signal,
        })
      ).data,
  });
}
