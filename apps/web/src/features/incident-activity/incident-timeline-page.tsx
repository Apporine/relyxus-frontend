'use client';

import { Button, Skeleton } from '@relyxus/ui';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { incidentWarRoomHref } from '@/features/incidents/routes';
import { useLiveConnectionStatus } from '@/lib/live/live-updates-provider';
import { QuerySection } from '@/lib/ui/query-section';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { FullTimeline } from './full-timeline';
import { useActivityIncident, useIncidentTimelineList } from './queries';
import { TimelineFiltersToolbar } from './timeline-filters';
import { timelineFiltersFromSearchParams } from './timeline-params';

function TimelinePlaceholder() {
  return <Skeleton className="h-[32rem] w-full" />;
}

/** Full incident timeline with filters (UI/UX s. 10.7). */
export function IncidentTimelinePage({ incidentReference }: { incidentReference: string }) {
  const translateTimeline = useTranslations('incidentTimeline');
  const searchParams = useSearchParams();
  const { workspace } = useCurrentWorkspace();
  const filters = timelineFiltersFromSearchParams(searchParams);
  const liveStatus = useLiveConnectionStatus();
  const incidentQuery = useActivityIncident(workspace.slug, incidentReference);
  const timelineQuery = useIncidentTimelineList(workspace.slug, incidentReference);

  const filteredEntries = useMemo(() => {
    const entries = timelineQuery.data ?? [];
    return entries.filter((entry) => {
      if (filters.actorKind !== null && entry.actorKind !== filters.actorKind) {
        return false;
      }
      if (filters.eventType !== null && entry.eventType !== filters.eventType) {
        return false;
      }
      return true;
    });
  }, [filters.actorKind, filters.eventType, timelineQuery.data]);

  if (incidentQuery.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-20 w-full" />
        <TimelinePlaceholder />
      </div>
    );
  }

  if (incidentQuery.isError) {
    const { error } = incidentQuery;
    return isHiddenOrMissing(error) ? (
      <NoAccessState />
    ) : (
      <PageLoadFailedState
        error={error}
        sectionName={translateTimeline('title')}
        onRetry={() => void incidentQuery.refetch()}
      />
    );
  }

  const incident = incidentQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateTimeline('title')}
        description={
          <>
            <Link
              href={incidentWarRoomHref(workspace.slug, incidentReference)}
              className="font-semibold text-fg-primary hover:underline"
            >
              {incident.reference}
            </Link>
            {' · '}
            {incident.title}
            {' · '}
            {translateTimeline('subtitle')}
          </>
        }
        actions={
          <>
            {liveStatus.state === 'open' ? (
              <span className="inline-flex h-7 items-center rounded-full border border-healthy px-3 text-meta font-semibold text-healthy">
                {translateTimeline('live')}
              </span>
            ) : null}
            <Button variant="secondary" disabled title={translateTimeline('addNoteUnavailable')}>
              {translateTimeline('addNote')}
            </Button>
          </>
        }
      />

      <TimelineFiltersToolbar
        workspaceSlug={workspace.slug}
        incidentReference={incidentReference}
        filters={filters}
      />

      <section className="rounded-panel border border-control bg-surface-1">
        <QuerySection
          query={timelineQuery}
          sectionName={translateTimeline('title')}
          loadingPlaceholder={<TimelinePlaceholder />}
        >
          {() =>
            filteredEntries.length === 0 && (timelineQuery.data?.length ?? 0) > 0 ? (
              <p className="p-6 text-body text-fg-secondary">
                {translateTimeline('noFilteredEvents')}
              </p>
            ) : (
              <FullTimeline entries={filteredEntries} />
            )
          }
        </QuerySection>
      </section>
    </div>
  );
}
