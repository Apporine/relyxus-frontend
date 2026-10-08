'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import { businessServiceAtRiskListSchema } from './model';

export const businessServiceHealthEvents = ['business-service.health-changed.v1'] as const;

export const serviceQueryKeys = {
  businessServicesAtRisk: (workspaceSlug: string) =>
    ['workspaces', workspaceSlug, 'business-services', 'at-risk'] as const,
};

/** Business services that are not healthy, most severe first. */
export function useBusinessServicesAtRisk(workspaceSlug: string) {
  return useQuery({
    queryKey: serviceQueryKeys.businessServicesAtRisk(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/business-services`,
          query: { health: 'not-healthy' },
          responseSchema: businessServiceAtRiskListSchema,
          signal,
        })
      ).data.items,
  });
}
