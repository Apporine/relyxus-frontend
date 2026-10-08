'use client';

import { Button, Skeleton } from '@relyxus/ui';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { incidentWarRoomHref } from '@/features/incidents/routes';
import { useLiveConnectionStatus } from '@/lib/live/live-updates-provider';
import { useMediaQuery } from '@/lib/ui/use-media-query';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { EvidenceDetailPanel } from './evidence-detail-panel';
import { EvidenceFilters } from './evidence-filters';
import { EvidenceListPanel } from './evidence-list-panel';
import {
  evidenceExplorerHref,
  evidenceFiltersFromSearchParams,
  selectedEvidenceIdFromSearchParams,
} from './evidence-params';
import { HypothesisEvidencePanel } from './hypothesis-evidence-panel';
import {
  useEvidenceDetail,
  useEvidenceIncident,
  useEvidenceList,
  useInvestigationForEvidence,
} from './queries';

const THREE_COLUMN_MEDIA_QUERY = '(min-width: 90rem)';

/** Evidence Explorer (UI/UX s. 10.5): raw source evidence separate from AI interpretation. */
export function EvidenceExplorerPage({ incidentReference }: { incidentReference: string }) {
  const translateExplorer = useTranslations('evidenceExplorer');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace } = useCurrentWorkspace();
  const filters = evidenceFiltersFromSearchParams(searchParams);
  const selectedItemId = selectedEvidenceIdFromSearchParams(searchParams);
  const liveStatus = useLiveConnectionStatus();
  const showsThreeColumns = useMediaQuery(THREE_COLUMN_MEDIA_QUERY);

  const incidentQuery = useEvidenceIncident(workspace.slug, incidentReference);
  const isIncidentReadable = incidentQuery.isSuccess;
  const evidenceListQuery = useEvidenceList(
    workspace.slug,
    incidentReference,
    filters,
    isIncidentReadable,
  );
  const investigationQuery = useInvestigationForEvidence(
    workspace.slug,
    incidentReference,
    isIncidentReadable,
  );

  const items = evidenceListQuery.data ?? [];
  const resolvedSelectedId =
    selectedItemId !== null && items.some((item) => item.id === selectedItemId)
      ? selectedItemId
      : (items[0]?.id ?? null);

  useEffect(() => {
    if (!isIncidentReadable || evidenceListQuery.isPending || evidenceListQuery.isError) {
      return;
    }
    if (resolvedSelectedId === null || resolvedSelectedId === selectedItemId) {
      return;
    }
    router.replace(
      evidenceExplorerHref(workspace.slug, incidentReference, filters, resolvedSelectedId),
      { scroll: false },
    );
  }, [
    evidenceListQuery.isError,
    evidenceListQuery.isPending,
    filters,
    incidentReference,
    isIncidentReadable,
    resolvedSelectedId,
    router,
    selectedItemId,
    workspace.slug,
  ]);

  const detailQuery = useEvidenceDetail(
    workspace.slug,
    incidentReference,
    resolvedSelectedId,
    isIncidentReadable,
  );

  const sources = [...new Set(items.map((item) => item.sourceName))].sort();
  const sortedHypotheses =
    investigationQuery.data?.hypotheses.toSorted((first, second) => first.rank - second.rank) ?? [];
  const hypothesisOptions = sortedHypotheses.map((hypothesis) => hypothesis.id);
  const activeHypothesis = sortedHypotheses.find(
    (hypothesis) => hypothesis.id === filters.hypothesisId,
  );
  const hypothesisDisplayName =
    activeHypothesis === undefined ? null : String(activeHypothesis.rank).padStart(2, '0');

  if (incidentQuery.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[40rem] w-full" />
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
        sectionName={translateExplorer('title')}
        onRetry={() => void incidentQuery.refetch()}
      />
    );
  }

  const incident = incidentQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateExplorer('title')}
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
          </>
        }
        actions={
          <>
            {liveStatus.state === 'open' ? (
              <span className="inline-flex h-7 items-center rounded-full border border-healthy px-3 text-meta font-semibold text-healthy">
                {translateExplorer('live')}
              </span>
            ) : null}
            <Button variant="secondary" disabled>
              {translateExplorer('compare')}
            </Button>
          </>
        }
      />

      <EvidenceFilters
        workspaceSlug={workspace.slug}
        incidentReference={incidentReference}
        filters={filters}
        selectedItemId={resolvedSelectedId}
        sources={sources}
        itemCount={items.length}
        hypothesisIds={hypothesisOptions}
        hypothesisDisplayName={hypothesisDisplayName}
      />

      {showsThreeColumns ? (
        <div className="grid grid-cols-[minmax(17rem,360px)_minmax(0,1fr)_minmax(17rem,306px)] items-start gap-6">
          <EvidenceListPanel
            items={items}
            workspaceSlug={workspace.slug}
            incidentReference={incidentReference}
            filters={filters}
            selectedItemId={resolvedSelectedId}
          />
          <HypothesisEvidencePanel
            investigationQuery={investigationQuery}
            hypothesisId={filters.hypothesisId}
            filteredItems={items}
          />
          <EvidenceDetailPanel detailQuery={detailQuery} />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <EvidenceListPanel
            items={items}
            workspaceSlug={workspace.slug}
            incidentReference={incidentReference}
            filters={filters}
            selectedItemId={resolvedSelectedId}
          />
          <EvidenceDetailPanel detailQuery={detailQuery} />
          <HypothesisEvidencePanel
            investigationQuery={investigationQuery}
            hypothesisId={filters.hypothesisId}
            filteredItems={items}
          />
        </div>
      )}
    </div>
  );
}
