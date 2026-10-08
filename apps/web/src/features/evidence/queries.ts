'use client';

import { useQuery } from '@tanstack/react-query';

import { incidentDetailSchema, investigationSchema } from '@/features/war-room/model';
import { warRoomQueryKeys } from '@/features/war-room/queries';
import { requestApi } from '@/lib/api/http-client';
import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';

import type { EvidenceListFilters } from './model';
import { evidenceDetailSchema, evidenceListSchema } from './model';

/** Live events that add or refresh evidence (provisional names, ADR 0004). */
export const evidenceEvents = ['evidence.captured.v1', 'evidence.updated.v1'] as const;

export const evidenceQueryKeys = {
  incident: (workspaceSlug: string, reference: string) =>
    ['workspaces', workspaceSlug, 'incidents', 'detail', reference, 'header'] as const,
  list: (workspaceSlug: string, reference: string, filters: EvidenceListFilters) =>
    ['workspaces', workspaceSlug, 'incidents', reference, 'evidence', 'list', filters] as const,
  detail: (workspaceSlug: string, reference: string, evidenceId: string) =>
    ['workspaces', workspaceSlug, 'incidents', reference, 'evidence', evidenceId] as const,
};

function incidentPath(workspaceSlug: string, reference: string): string {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}/incidents/${encodeURIComponent(reference)}`;
}

function listQueryParameters(
  filters: EvidenceListFilters,
): Record<string, string | readonly string[]> {
  return {
    ...(filters.source === null ? {} : { source: filters.source }),
    ...(filters.hypothesisId === null ? {} : { hypothesis: filters.hypothesisId }),
    ...(filters.freshness === 'all' ? {} : { freshness: filters.freshness }),
  };
}

/** Incident header fields for the explorer subtitle (same access rules as the war room). */
export function useEvidenceIncident(workspaceSlug: string, reference: string) {
  return useQuery({
    queryKey: evidenceQueryKeys.incident(workspaceSlug, reference),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: incidentPath(workspaceSlug, reference),
          responseSchema: incidentDetailSchema,
          signal,
        })
      ).data,
  });
}

/** Evidence summaries for the left list, honouring URL-backed filters. */
export function useEvidenceList(
  workspaceSlug: string,
  reference: string,
  filters: EvidenceListFilters,
  enabled: boolean,
) {
  const queryKey = evidenceQueryKeys.list(workspaceSlug, reference, filters);
  const query = useQuery({
    queryKey,
    enabled,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${incidentPath(workspaceSlug, reference)}/evidence`,
          query: listQueryParameters(filters),
          responseSchema: evidenceListSchema,
          signal,
        })
      ).data.items,
  });
  useRefreshOnLiveEvents(evidenceEvents, queryKey);
  return query;
}

/** Raw source payload for the detail panel; null id skips the request. */
export function useEvidenceDetail(
  workspaceSlug: string,
  reference: string,
  evidenceId: string | null,
  enabled: boolean,
) {
  const queryKey = evidenceQueryKeys.detail(workspaceSlug, reference, evidenceId ?? '__none__');
  const query = useQuery({
    queryKey,
    enabled: enabled && evidenceId !== null,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${incidentPath(workspaceSlug, reference)}/evidence/${encodeURIComponent(evidenceId ?? '')}`,
          responseSchema: evidenceDetailSchema,
          signal,
        })
      ).data,
  });
  useRefreshOnLiveEvents(evidenceEvents, queryKey);
  return query;
}

/** Investigation context for the hypothesis column; shares cache with the war room. */
export function useInvestigationForEvidence(
  workspaceSlug: string,
  reference: string,
  enabled: boolean,
) {
  const queryKey = warRoomQueryKeys.section(workspaceSlug, reference, 'investigation');
  const query = useQuery({
    queryKey,
    enabled,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${incidentPath(workspaceSlug, reference)}/investigation`,
          responseSchema: investigationSchema,
          signal,
        })
      ).data,
  });
  useRefreshOnLiveEvents(['investigation.updated.v1'], queryKey);
  return query;
}
