import type { Route } from 'next';

import { incidentTimelineHref } from '@/features/incidents/routes';
import type { TimelineActorKind, TimelineEventType } from '@/features/war-room/model';
import { timelineActorKinds, timelineEventTypes } from '@/features/war-room/model';

export type TimelineFilters = {
  actorKind: TimelineActorKind | null;
  eventType: TimelineEventType | null;
};

export function timelineFiltersFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): TimelineFilters {
  const actorParam = searchParams.get('actor');
  const typeParam = searchParams.get('type');
  const actorKind = timelineActorKinds.find((value) => value === actorParam) ?? null;
  const eventType = timelineEventTypes.find((value) => value === typeParam) ?? null;

  return { actorKind, eventType };
}

export function incidentTimelineHrefWithFilters(
  workspaceSlug: string,
  incidentReference: string,
  filters: TimelineFilters,
): Route {
  const parameters = new URLSearchParams();
  if (filters.actorKind !== null) {
    parameters.set('actor', filters.actorKind);
  }
  if (filters.eventType !== null) {
    parameters.set('type', filters.eventType);
  }
  const queryString = parameters.toString();
  const base = incidentTimelineHref(workspaceSlug, incidentReference);
  return `${base}${queryString === '' ? '' : `?${queryString}`}` as Route;
}
