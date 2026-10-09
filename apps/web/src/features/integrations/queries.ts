'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import {
  connectedSystemListSchema,
  connectorCatalogueSchema,
  connectorSummaryListSchema,
} from './model';

export const connectorHealthEvents = ['connector.health-changed.v1'] as const;

export const integrationQueryKeys = {
  connectors: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'connectors'] as const,
  connectedSystems: (workspaceSlug: string) =>
    [...integrationQueryKeys.connectors(workspaceSlug), 'connected'] as const,
  catalogue: (workspaceSlug: string) =>
    [...integrationQueryKeys.connectors(workspaceSlug), 'catalogue'] as const,
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

function integrationsPath(workspaceSlug: string): string {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}/integrations`;
}

export function useConnectedSystems(workspaceSlug: string) {
  return useQuery({
    queryKey: integrationQueryKeys.connectedSystems(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${integrationsPath(workspaceSlug)}/connected`,
          responseSchema: connectedSystemListSchema,
          signal,
        })
      ).data.items,
  });
}

export function useConnectorCatalogue(workspaceSlug: string) {
  return useQuery({
    queryKey: integrationQueryKeys.catalogue(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${integrationsPath(workspaceSlug)}/catalogue`,
          responseSchema: connectorCatalogueSchema,
          signal,
        })
      ).data.items,
  });
}
