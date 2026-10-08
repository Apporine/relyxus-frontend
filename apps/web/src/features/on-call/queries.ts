'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import {
  escalationChainSchema,
  onCallScheduleDetailSchema,
  onCallScheduleListSchema,
} from './model';

export const onCallQueryKeys = {
  all: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'on-call'] as const,
  schedules: (workspaceSlug: string) =>
    [...onCallQueryKeys.all(workspaceSlug), 'schedules'] as const,
  detail: (workspaceSlug: string, scheduleId: string) =>
    [...onCallQueryKeys.all(workspaceSlug), 'detail', scheduleId] as const,
  escalation: (workspaceSlug: string, scheduleId: string) =>
    [...onCallQueryKeys.all(workspaceSlug), 'escalation', scheduleId] as const,
};

function onCallPath(workspaceSlug: string): string {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}/on-call`;
}

export function useOnCallSchedules(workspaceSlug: string) {
  return useQuery({
    queryKey: onCallQueryKeys.schedules(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${onCallPath(workspaceSlug)}/schedules`,
          responseSchema: onCallScheduleListSchema,
          signal,
        })
      ).data.items,
  });
}

export function useOnCallScheduleDetail(workspaceSlug: string, scheduleId: string | null) {
  return useQuery({
    queryKey: onCallQueryKeys.detail(workspaceSlug, scheduleId ?? ''),
    enabled: scheduleId !== null,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${onCallPath(workspaceSlug)}/schedules/${encodeURIComponent(scheduleId ?? '')}`,
          responseSchema: onCallScheduleDetailSchema,
          signal,
        })
      ).data,
  });
}

export function useEscalationChain(workspaceSlug: string, scheduleId: string | null) {
  return useQuery({
    queryKey: onCallQueryKeys.escalation(workspaceSlug, scheduleId ?? ''),
    enabled: scheduleId !== null,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${onCallPath(workspaceSlug)}/schedules/${encodeURIComponent(scheduleId ?? '')}/escalation`,
          responseSchema: escalationChainSchema,
          signal,
        })
      ).data,
  });
}
