'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import { lastDaySummarySchema, reliabilityAnalyticsSchema } from './model';

export const analyticsQueryKeys = {
  lastDaySummary: (workspaceSlug: string) =>
    ['workspaces', workspaceSlug, 'metrics', 'last-24-hours'] as const,
  reliability: (workspaceSlug: string) =>
    ['workspaces', workspaceSlug, 'analytics', 'reliability'] as const,
};

export function useLastDaySummary(workspaceSlug: string) {
  return useQuery({
    queryKey: analyticsQueryKeys.lastDaySummary(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/metrics/last-24-hours`,
          responseSchema: lastDaySummarySchema,
          signal,
        })
      ).data,
  });
}

export function useReliabilityAnalytics(workspaceSlug: string) {
  return useQuery({
    queryKey: analyticsQueryKeys.reliability(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/analytics/reliability`,
          responseSchema: reliabilityAnalyticsSchema,
          signal,
        })
      ).data,
  });
}
