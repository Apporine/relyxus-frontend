'use client';

import { Button, EmptyState, Skeleton } from '@relyxus/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId } from 'react';

import { useCanChangeState } from '@/lib/live/live-updates-provider';
import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';
import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { useMediaQuery } from '@/lib/ui/use-media-query';
import { useSearchParamChoice } from '@/lib/ui/use-search-param-choice';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { DependencyMapPanel } from './dependency-map-panel';
import {
  serviceCatalogueEvents,
  serviceQueryKeys,
  useServiceCatalogue,
  useServiceDependencies,
  useServiceDetail,
} from './queries';
import { ServiceDetailPanel } from './service-detail-panel';
import { ServiceListPanel } from './service-list-panel';
import {
  SERVICE_TAB_PARAMETER,
  selectedServiceIdFromSearchParams,
  serviceDetailTabs,
  serviceSearchTextFromSearchParams,
  servicesHref,
} from './service-params';

/** Figma frame 26: list beside the service area at 1440 px and wider, stacked below. */
const TWO_COLUMN_MEDIA_QUERY = '(min-width: 90rem)';

function AddServiceAction() {
  const translateServices = useTranslations('services');
  const unavailableNoteId = useId();
  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="primary" disabled aria-describedby={unavailableNoteId}>
        {translateServices('addService')}
      </Button>
      <p id={unavailableNoteId} className="max-w-72 text-end text-meta text-fg-tertiary">
        {translateServices('addServiceUnavailable')}
      </p>
    </div>
  );
}

/** Services and dependency map (UI/UX s. 13.2): know what depends on what. */
export function ServicesPage() {
  const translateServices = useTranslations('services');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace } = useCurrentWorkspace();
  const canChangeState = useCanChangeState();
  const showsTwoColumns = useMediaQuery(TWO_COLUMN_MEDIA_QUERY);
  const selectedServiceId = selectedServiceIdFromSearchParams(searchParams);
  const searchText = serviceSearchTextFromSearchParams(searchParams);
  const [selectedTab, selectTab] = useSearchParamChoice(
    SERVICE_TAB_PARAMETER,
    serviceDetailTabs,
    'overview',
  );

  const catalogueQuery = useServiceCatalogue(workspace.slug, searchText);
  useRefreshOnLiveEvents(serviceCatalogueEvents, serviceQueryKeys.catalogue(workspace.slug));

  // A service named in the URL stays selected even when the search hides it from the list.
  const resolvedServiceId = selectedServiceId ?? catalogueQuery.data?.[0]?.id ?? null;

  useEffect(() => {
    if (!catalogueQuery.isSuccess || selectedServiceId !== null || resolvedServiceId === null) {
      return;
    }
    router.replace(
      servicesHref(workspace.slug, { serviceId: resolvedServiceId, tab: selectedTab, searchText }),
      { scroll: false },
    );
  }, [
    catalogueQuery.isSuccess,
    resolvedServiceId,
    router,
    searchText,
    selectedServiceId,
    selectedTab,
    workspace.slug,
  ]);

  const detailQuery = useServiceDetail(workspace.slug, resolvedServiceId);
  const dependenciesQuery = useServiceDependencies(workspace.slug, resolvedServiceId);

  const changeSearchText = useCallback(
    (nextSearchText: string) =>
      router.replace(
        servicesHref(workspace.slug, {
          serviceId: selectedServiceId,
          tab: selectedTab,
          searchText: nextSearchText,
        }),
        { scroll: false },
      ),
    [router, selectedServiceId, selectedTab, workspace.slug],
  );
  const showAllDependencies = useCallback(() => selectTab('dependencies'), [selectTab]);

  if (catalogueQuery.isPending) {
    return <PageLoadingState />;
  }
  if (catalogueQuery.isError && catalogueQuery.data === undefined) {
    return (
      <PageLoadFailedState
        error={catalogueQuery.error}
        sectionName={translateServices('title')}
        onRetry={() => void catalogueQuery.refetch()}
      />
    );
  }

  const serviceArea =
    resolvedServiceId === null ? (
      searchText === '' ? null : (
        <EmptyState
          kind="filtered"
          title={translateServices('noSelectionTitle')}
          description={translateServices('noSelectionDescription')}
        />
      )
    ) : detailQuery.isPending ? (
      <div aria-busy="true" className="flex flex-col gap-6">
        <Skeleton className="h-[28rem] w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ) : detailQuery.isError ? (
      isHiddenOrMissing(detailQuery.error) ? (
        <NoAccessState />
      ) : (
        <PageLoadFailedState
          error={detailQuery.error}
          sectionName={translateServices('detailSectionName')}
          onRetry={() => void detailQuery.refetch()}
        />
      )
    ) : (
      <div className="flex min-w-0 flex-col gap-6">
        <DependencyMapPanel
          query={dependenciesQuery}
          workspaceSlug={workspace.slug}
          service={detailQuery.data}
          selectedTab={selectedTab}
          searchText={searchText}
          onShowAllDependencies={showAllDependencies}
        />
        <ServiceDetailPanel
          workspaceSlug={workspace.slug}
          service={detailQuery.data}
          dependenciesQuery={dependenciesQuery}
          selectedTab={selectedTab}
          onSelectTab={selectTab}
          canChangeState={canChangeState}
        />
      </div>
    );

  const listPanel = (
    <ServiceListPanel
      workspaceSlug={workspace.slug}
      query={catalogueQuery}
      selectedServiceId={resolvedServiceId}
      selectedTab={selectedTab}
      searchText={searchText}
      onSearchTextChange={changeSearchText}
    />
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateServices('title')}
        description={translateServices('description')}
        actions={<AddServiceAction />}
      />
      <div
        className={
          showsTwoColumns
            ? 'grid grid-cols-[minmax(17rem,330px)_minmax(0,1fr)] items-start gap-6'
            : 'flex flex-col gap-6'
        }
      >
        {listPanel}
        {serviceArea}
      </div>
    </div>
  );
}
