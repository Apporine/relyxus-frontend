'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import { incidentSummaryListSchema } from './model';

/** Live events after which incident lists are re-read (provisional names, ADR 0004). */
export const incidentListEvents = [
  'incident.declared.v1',
  'incident.updated.v1',
  'incident.resolved.v1',
] as const;

export const incidentQueryKeys = {
  active: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'incidents', 'active'] as const,
};

/** Open incidents ordered by severity, then by how long they have been running. */
export function useActiveIncidents(workspaceSlug: string) {
  return useQuery({
    queryKey: incidentQueryKeys.active(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/incidents`,
          query: { status: 'active', sort: 'severity' },
          responseSchema: incidentSummaryListSchema,
          signal,
        })
      ).data.items,
  });
}
