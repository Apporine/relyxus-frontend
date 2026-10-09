'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import { complianceOverviewSchema, regulatorClockListSchema } from './model';

export const regulatorClockEvents = [
  'clock.started.v1',
  'clock.updated.v1',
  'clock.stopped.v1',
] as const;

export const complianceQueryKeys = {
  activeClocks: (workspaceSlug: string) =>
    ['workspaces', workspaceSlug, 'regulator-clocks', 'active'] as const,
  overview: (workspaceSlug: string) =>
    ['workspaces', workspaceSlug, 'compliance', 'overview'] as const,
};

/** Running regulator clocks, nearest deadline first. */
export function useActiveRegulatorClocks(workspaceSlug: string) {
  return useQuery({
    queryKey: complianceQueryKeys.activeClocks(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/regulator-clocks`,
          query: { status: 'active', sort: 'deadline' },
          responseSchema: regulatorClockListSchema,
          signal,
        })
      ).data.items,
  });
}

export function useComplianceOverview(workspaceSlug: string) {
  return useQuery({
    queryKey: complianceQueryKeys.overview(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/compliance/overview`,
          responseSchema: complianceOverviewSchema,
          signal,
        })
      ).data,
  });
}
