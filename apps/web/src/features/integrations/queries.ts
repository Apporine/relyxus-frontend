'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import { connectorSummaryListSchema } from './model';

export const connectorHealthEvents = ['connector.health-changed.v1'] as const;

export const integrationQueryKeys = {
  connectors: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'connectors'] as const,
};

/** Every connector in the workspace with its current health. */
export function useConnectorHealth(workspaceSlug: string) {
  return useQuery({
    queryKey: integrationQueryKeys.connectors(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/connectors`,
          responseSchema: connectorSummaryListSchema,
          signal,
        })
      ).data.items,
  });
}
