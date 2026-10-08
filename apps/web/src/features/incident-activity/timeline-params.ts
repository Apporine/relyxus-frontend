import type { Route } from 'next';

import type { TimelineActorKind } from '@relyxus/ui';
import { timelineActorKinds } from '@relyxus/ui';

import { incidentTimelineHref } from '@/features/incidents/routes';
import type { TimelineEventType } from '@/features/war-room/model';
import { timelineEventTypes } from '@/features/war-room/model';

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
