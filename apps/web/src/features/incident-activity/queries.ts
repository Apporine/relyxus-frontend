'use client';

import { useQuery } from '@tanstack/react-query';

import {
  incidentDetailSchema,
  incidentTaskListSchema,
  timelineEntryListSchema,
} from '@/features/war-room/model';
import { warRoomQueryKeys } from '@/features/war-room/queries';
import { requestApi } from '@/lib/api/http-client';
import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';

/** Live events for the full tasks and timeline views (provisional names, ADR 0004). */
const activityEvents = {
  timeline: ['timeline.entry-added.v1'],
  tasks: ['task.created.v1', 'task.updated.v1'],
} as const;

function incidentPath(workspaceSlug: string, reference: string): string {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}/incidents/${encodeURIComponent(reference)}`;
}

/** Incident header for tasks and timeline subtitles (same access rules as the war room). */
export function useActivityIncident(workspaceSlug: string, reference: string) {
  return useQuery({
    queryKey: warRoomQueryKeys.section(workspaceSlug, reference, 'incident-header'),
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

/** All tasks for the kanban board. */
export function useIncidentTasksList(workspaceSlug: string, reference: string) {
  const queryKey = warRoomQueryKeys.section(workspaceSlug, reference, 'tasks');
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${incidentPath(workspaceSlug, reference)}/tasks`,
          responseSchema: incidentTaskListSchema,
          signal,
        })
      ).data.items,
  });
  useRefreshOnLiveEvents(activityEvents.tasks, queryKey);
  return query;
}

/** All timeline entries for the full timeline view. */
export function useIncidentTimelineList(workspaceSlug: string, reference: string) {
  const queryKey = warRoomQueryKeys.section(workspaceSlug, reference, 'timeline');
  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${incidentPath(workspaceSlug, reference)}/timeline`,
          responseSchema: timelineEntryListSchema,
          signal,
        })
      ).data.items,
  });
  useRefreshOnLiveEvents(activityEvents.timeline, queryKey);
  return query;
}
