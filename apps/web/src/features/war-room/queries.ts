'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { regulatorClockListSchema } from '@/features/compliance/model';
import { regulatorClockEvents } from '@/features/compliance/queries';
import { newIdempotencyKey, requestApi } from '@/lib/api/http-client';
import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';

import {
  acknowledgementResponseSchema,
  communicationsSchema,
  incidentDetailSchema,
  incidentTaskListSchema,
  investigationSchema,
  proposedActionListSchema,
  timelineEntryListSchema,
} from './model';

/** Live events that change each panel (provisional names, ADR 0004). */
const warRoomEvents = {
  incident: ['incident.updated.v1', 'incident.acknowledged.v1'],
  investigation: ['investigation.updated.v1'],
  actions: [
    'action.proposed.v1',
    'action.updated.v1',
    'approval.decided.v1',
    'approval.expired.v1',
  ],
  communications: ['communication.updated.v1'],
  timeline: ['timeline.entry-added.v1'],
  tasks: ['task.created.v1', 'task.updated.v1'],
} as const;

export const warRoomQueryKeys = {
  all: (workspaceSlug: string, reference: string) =>
    ['workspaces', workspaceSlug, 'incidents', 'detail', reference] as const,
  section: (workspaceSlug: string, reference: string, section: string) =>
    [...warRoomQueryKeys.all(workspaceSlug, reference), section] as const,
};

function incidentPath(workspaceSlug: string, reference: string): string {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}/incidents/${encodeURIComponent(reference)}`;
}

/** Loads every war room panel and re-reads each one when its live events arrive. */
export function useWarRoomData(workspaceSlug: string, reference: string) {
  const path = incidentPath(workspaceSlug, reference);
  const sectionKey = (section: string) =>
    warRoomQueryKeys.section(workspaceSlug, reference, section);

  const incidentQuery = useQuery({
    queryKey: sectionKey('incident'),
    queryFn: async ({ signal }) =>
      (await requestApi({ path, responseSchema: incidentDetailSchema, signal })).data,
  });
  // Panels wait for the incident itself, so a restricted incident triggers no further requests.
  const isIncidentReadable = incidentQuery.isSuccess;

  const investigationQuery = useQuery({
    queryKey: sectionKey('investigation'),
    enabled: isIncidentReadable,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${path}/investigation`,
          responseSchema: investigationSchema,
          signal,
        })
      ).data,
  });
  const actionsQuery = useQuery({
    queryKey: sectionKey('actions'),
    enabled: isIncidentReadable,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${path}/actions`,
          query: { status: 'pending' },
          responseSchema: proposedActionListSchema,
          signal,
        })
      ).data.items,
  });
  const clocksQuery = useQuery({
    queryKey: sectionKey('clocks'),
    enabled: isIncidentReadable,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${path}/clocks`,
          responseSchema: regulatorClockListSchema,
          signal,
        })
      ).data.items,
  });
  const communicationsQuery = useQuery({
    queryKey: sectionKey('communications'),
    enabled: isIncidentReadable,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${path}/communications`,
          responseSchema: communicationsSchema,
          signal,
        })
      ).data,
  });
  const timelineQuery = useQuery({
    queryKey: sectionKey('timeline'),
    enabled: isIncidentReadable,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${path}/timeline`,
          responseSchema: timelineEntryListSchema,
          signal,
        })
      ).data.items,
  });
  const tasksQuery = useQuery({
    queryKey: sectionKey('tasks'),
    enabled: isIncidentReadable,
    queryFn: async ({ signal }) =>
      (await requestApi({ path: `${path}/tasks`, responseSchema: incidentTaskListSchema, signal }))
        .data.items,
  });

  useRefreshOnLiveEvents(warRoomEvents.incident, sectionKey('incident'));
  useRefreshOnLiveEvents(warRoomEvents.investigation, sectionKey('investigation'));
  useRefreshOnLiveEvents(warRoomEvents.actions, sectionKey('actions'));
  useRefreshOnLiveEvents(regulatorClockEvents, sectionKey('clocks'));
  useRefreshOnLiveEvents(warRoomEvents.communications, sectionKey('communications'));
  useRefreshOnLiveEvents(warRoomEvents.timeline, sectionKey('timeline'));
  useRefreshOnLiveEvents(warRoomEvents.tasks, sectionKey('tasks'));

  return {
    incidentQuery,
    investigationQuery,
    actionsQuery,
    clocksQuery,
    communicationsQuery,
    timelineQuery,
    tasksQuery,
  };
}

/**
 * Acknowledge (level 0 on the confirmation ladder, UI/UX s. 8). One idempotency key per
 * intent, so a retried request can never record two acknowledgements.
 */
export function useAcknowledgeIncident(workspaceSlug: string, reference: string) {
  const queryClient = useQueryClient();
  const [idempotencyKey] = useState(newIdempotencyKey);

  return useMutation({
    mutationFn: async () =>
      (
        await requestApi({
          method: 'POST',
          path: `${incidentPath(workspaceSlug, reference)}/acknowledgements`,
          body: {},
          idempotencyKey,
          responseSchema: acknowledgementResponseSchema,
        })
      ).data,
    // Acknowledging also adds a timeline entry, so every panel of this incident is re-read.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: warRoomQueryKeys.all(workspaceSlug, reference) }),
  });
}
