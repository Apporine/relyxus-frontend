'use client';

import { cn } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import type { TimelineEntry } from '@/features/war-room/model';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { NewUpdatesPill } from '@/lib/live/new-updates-pill';
import { useLiveUpdateBuffer } from '@/lib/live/use-live-update-buffer';

const timelineEntryIdOf = (entry: TimelineEntry) => entry.id;

function FullTimelineRow({ entry }: { entry: TimelineEntry }) {
  const translateActivity = useTranslations('warRoom.activity');
  const translateTimeline = useTranslations('incidentTimeline');
  const format = useRelyxusFormat();

  return (
    <li className="md:grid-cols-[5rem_0.5rem_8rem_auto_minmax(0,1fr)] md:items-start md:gap-x-3 grid grid-cols-1 gap-3 border-b border-divider py-4 last:border-b-0">
      <time
        dateTime={entry.occurredAt}
        className="md:pt-0.5 font-mono text-meta text-fg-tertiary tabular-nums"
      >
        {format.timeOfDay(new Date(entry.occurredAt), { includeSeconds: true })}
      </time>
      <span
        aria-hidden
        className={cn(
          'md:mt-2 md:block hidden size-2 rounded-full',
          entry.needsAttention ? 'bg-warning' : 'bg-fg-secondary',
        )}
      />
      <p className="text-table font-semibold text-fg-primary">
        {entry.actorName}
        <span className="sr-only"> ({translateActivity(`actorKinds.${entry.actorKind}`)})</span>
      </p>
      {entry.eventType === undefined || entry.eventType === null ? (
        <span className="md:block hidden" />
      ) : (
        <span className="md:justify-self-start inline-flex h-6 w-fit items-center rounded-full border border-control bg-surface-2 px-2.5 text-meta font-semibold text-fg-secondary">
          {translateTimeline(`filters.eventTypes.${entry.eventType}`)}
        </span>
      )}
      <div className="md:col-span-1 flex min-w-0 flex-col gap-1">
        <p className="text-table font-medium text-fg-primary">{entry.summary}</p>
        {entry.contextDetail === undefined || entry.contextDetail === null ? null : (
          <p className="text-meta text-fg-secondary">{entry.contextDetail}</p>
        )}
      </div>
    </li>
  );
}

/** Full incident timeline with newest events first (UI/UX s. 10.7). */
export function FullTimeline({ entries }: { entries: TimelineEntry[] }) {
  const translateActivity = useTranslations('warRoom.activity');
  const sortedEntries = entries.toSorted(
    (first, second) => Date.parse(second.occurredAt) - Date.parse(first.occurredAt),
  );
  const { visibleItems, pendingItems, revealPending } = useLiveUpdateBuffer(
    sortedEntries,
    timelineEntryIdOf,
    { hasLoaded: true },
  );

  if (visibleItems.length === 0 && pendingItems.length === 0) {
    return <p className="p-6 text-body text-fg-secondary">{translateActivity('noTimeline')}</p>;
  }

  return (
    <div className="flex flex-col">
      <ol aria-label={translateActivity('timeline')} className="px-6">
        {visibleItems.map((entry) => (
          <FullTimelineRow key={entry.id} entry={entry} />
        ))}
      </ol>
      <div className="flex justify-center px-6 pb-4 empty:hidden">
        <NewUpdatesPill pendingCount={pendingItems.length} onReveal={revealPending} />
      </div>
    </div>
  );
}
