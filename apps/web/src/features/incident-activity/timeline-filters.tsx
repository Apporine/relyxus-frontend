'use client';

import { cn } from '@relyxus/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { timelineActorKinds, timelineEventTypes } from '@/features/war-room/model';
import { useTimeDisplay } from '@/lib/format/time-display';

import { incidentTimelineHrefWithFilters, type TimelineFilters } from './timeline-params';

type TimelineFiltersProps = {
  workspaceSlug: string;
  incidentReference: string;
  filters: TimelineFilters;
};

function FilterPill({ label, href, isActive }: { label: string; href: Route; isActive?: boolean }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'inline-flex h-7 items-center rounded-full border px-3 text-meta font-semibold',
        isActive
          ? 'border-fg-primary bg-selected text-fg-primary'
          : 'border-control bg-surface-2 text-fg-primary hover:bg-selected',
      )}
    >
      {label}
    </Link>
  );
}

function nextActorKind(current: TimelineFilters['actorKind']): TimelineFilters['actorKind'] {
  if (current === null) {
    return timelineActorKinds[0] ?? null;
  }
  const currentIndex = timelineActorKinds.indexOf(current);
  return timelineActorKinds[currentIndex + 1] ?? null;
}

function nextEventType(current: TimelineFilters['eventType']): TimelineFilters['eventType'] {
  if (current === null) {
    return timelineEventTypes[0] ?? null;
  }
  const currentIndex = timelineEventTypes.indexOf(current);
  return timelineEventTypes[currentIndex + 1] ?? null;
}

/** URL-backed actor and event-type filters for the full timeline (Figma frame 09). */
export function TimelineFiltersToolbar({
  workspaceSlug,
  incidentReference,
  filters,
}: TimelineFiltersProps) {
  const translateFilters = useTranslations('incidentTimeline.filters');
  const translateActivity = useTranslations('warRoom.activity');
  const { isShowingUtc, canToggleUtc, toggleUtc } = useTimeDisplay();

  const actorLabel =
    filters.actorKind === null
      ? translateFilters('actorAll')
      : translateFilters('actorLabel', {
          actor: translateActivity(`actorKinds.${filters.actorKind}`),
        });
  const typeLabel =
    filters.eventType === null
      ? translateFilters('typeAll')
      : translateFilters('typeLabel', {
          type: translateFilters(`eventTypes.${filters.eventType}`),
        });

  return (
    <div
      role="toolbar"
      aria-label={translateFilters('toolbarLabel')}
      className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-control bg-surface-1 px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          label={translateFilters('eventsAll')}
          href={incidentTimelineHrefWithFilters(workspaceSlug, incidentReference, {
            actorKind: null,
            eventType: null,
          })}
          isActive={filters.actorKind === null && filters.eventType === null}
        />
        <FilterPill
          label={actorLabel}
          href={incidentTimelineHrefWithFilters(workspaceSlug, incidentReference, {
            ...filters,
            actorKind: nextActorKind(filters.actorKind),
          })}
          isActive={filters.actorKind !== null}
        />
        <FilterPill
          label={typeLabel}
          href={incidentTimelineHrefWithFilters(workspaceSlug, incidentReference, {
            ...filters,
            eventType: nextEventType(filters.eventType),
          })}
          isActive={filters.eventType !== null}
        />
        {canToggleUtc ? (
          <button
            type="button"
            aria-pressed={isShowingUtc}
            onClick={toggleUtc}
            className={cn(
              'inline-flex h-7 items-center rounded-full border px-3 text-meta font-semibold',
              isShowingUtc
                ? 'border-fg-primary bg-selected text-fg-primary'
                : 'border-control bg-surface-2 text-fg-primary hover:bg-selected',
            )}
          >
            UTC
          </button>
        ) : (
          <span className="inline-flex h-7 items-center rounded-full border border-control bg-surface-2 px-3 text-meta font-semibold text-fg-primary">
            UTC
          </span>
        )}
      </div>
    </div>
  );
}
