'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import {
  modelRouteListSchema,
  replayRunDetailSchema,
  replayRunListSchema,
  scorecardSchema,
} from './model';

export const aiQualityEvents = [
  'replay-run.progressed.v1',
  'replay-run.completed.v1',
  'model-route.changed.v1',
] as const;

export const aiQualityQueryKeys = {
  all: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'ai-quality'] as const,
  scorecard: (workspaceSlug: string) =>
    [...aiQualityQueryKeys.all(workspaceSlug), 'scorecard'] as const,
  modelRoutes: (workspaceSlug: string) =>
    [...aiQualityQueryKeys.all(workspaceSlug), 'model-routes'] as const,
  replayRuns: (workspaceSlug: string) =>
    [...aiQualityQueryKeys.all(workspaceSlug), 'replay-runs'] as const,
  replayRun: (workspaceSlug: string, runId: string) =>
    [...aiQualityQueryKeys.replayRuns(workspaceSlug), runId] as const,
};

function workspacePath(workspaceSlug: string): string {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}`;
}

export function useScorecard(workspaceSlug: string) {
  return useQuery({
    queryKey: aiQualityQueryKeys.scorecard(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${workspacePath(workspaceSlug)}/ai-quality/scorecard`,
          responseSchema: scorecardSchema,
          signal,
        })
      ).data,
  });
}

export function useModelRoutes(workspaceSlug: string) {
  return useQuery({
    queryKey: aiQualityQueryKeys.modelRoutes(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${workspacePath(workspaceSlug)}/ai-quality/model-routes`,
          responseSchema: modelRouteListSchema,
          signal,
        })
      ).data.items,
  });
}

export function useReplayRuns(workspaceSlug: string) {
  return useQuery({
    queryKey: aiQualityQueryKeys.replayRuns(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${workspacePath(workspaceSlug)}/replay-runs`,
          responseSchema: replayRunListSchema,
          signal,
        })
      ).data.items,
  });
}

export function useReplayRun(workspaceSlug: string, runId: string) {
  return useQuery({
    queryKey: aiQualityQueryKeys.replayRun(workspaceSlug, runId),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${workspacePath(workspaceSlug)}/replay-runs/${encodeURIComponent(runId)}`,
          responseSchema: replayRunDetailSchema,
          signal,
        })
      ).data,
  });
}
