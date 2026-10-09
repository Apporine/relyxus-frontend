'use client';

import { Button, EmptyState, Skeleton } from '@relyxus/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useId } from 'react';

import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';
import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { useMediaQuery } from '@/lib/ui/use-media-query';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { BusinessServiceListPanel } from './business-service-list-panel';
import {
  businessServicesHref,
  selectedBusinessServiceIdFromSearchParams,
} from './business-service-params';
import { BusinessServicePosturePanel } from './business-service-posture-panel';
import { BusinessServiceTolerancePanel } from './business-service-tolerance-panel';
import {
  businessServiceHealthEvents,
  serviceQueryKeys,
  useBusinessServiceDetail,
  useBusinessServices,
} from './queries';
import { ServicesAreaNavigation } from './services-area-navigation';

/** Figma frame 20: three columns at 1440 px and wider, stacked below. */
const THREE_COLUMN_MEDIA_QUERY = '(min-width: 90rem)';

function NewBusinessServiceAction() {
  const translateBusinessServices = useTranslations('businessServices');
  const unavailableNoteId = useId();
  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="primary" disabled aria-describedby={unavailableNoteId}>
        {translateBusinessServices('newService')}
      </Button>
      <p id={unavailableNoteId} className="max-w-72 text-end text-meta text-fg-tertiary">
        {translateBusinessServices('newServiceUnavailable')}
      </p>
    </div>
  );
}

/** Business services and tolerances (UI/UX s. 12.5): the operational resilience view. */
export function BusinessServicesPage() {
  const translateBusinessServices = useTranslations('businessServices');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workspace } = useCurrentWorkspace();
  const showsThreeColumns = useMediaQuery(THREE_COLUMN_MEDIA_QUERY);
  const selectedBusinessServiceId = selectedBusinessServiceIdFromSearchParams(searchParams);

  const listQuery = useBusinessServices(workspace.slug);
  useRefreshOnLiveEvents(
    businessServiceHealthEvents,
    serviceQueryKeys.businessServices(workspace.slug),
  );
  const resolvedBusinessServiceId = selectedBusinessServiceId ?? listQuery.data?.[0]?.id ?? null;

  useEffect(() => {
    if (
      !listQuery.isSuccess ||
      selectedBusinessServiceId !== null ||
      resolvedBusinessServiceId === null
    ) {
      return;
    }
    router.replace(businessServicesHref(workspace.slug, resolvedBusinessServiceId), {
      scroll: false,
    });
  }, [
    listQuery.isSuccess,
    resolvedBusinessServiceId,
    router,
    selectedBusinessServiceId,
    workspace.slug,
  ]);

  const detailQuery = useBusinessServiceDetail(workspace.slug, resolvedBusinessServiceId);

  if (listQuery.isPending) {
    return <PageLoadingState />;
  }
  if (listQuery.isError) {
    return (
      <PageLoadFailedState
        error={listQuery.error}
        sectionName={translateBusinessServices('title')}
        onRetry={() => void listQuery.refetch()}
      />
    );
  }

  const listPanel = (
    <BusinessServiceListPanel
      workspaceSlug={workspace.slug}
      query={listQuery}
      selectedBusinessServiceId={resolvedBusinessServiceId}
    />
  );

  const detailColumns =
    resolvedBusinessServiceId === null ? null : detailQuery.isPending ? (
      <>
        <Skeleton aria-busy="true" className="h-[40rem] w-full" />
        <Skeleton aria-busy="true" className="h-80 w-full" />
      </>
    ) : detailQuery.isError ? (
      isHiddenOrMissing(detailQuery.error) ? (
        <NoAccessState />
      ) : (
        <PageLoadFailedState
          error={detailQuery.error}
          sectionName={translateBusinessServices('detailSectionName')}
          onRetry={() => void detailQuery.refetch()}
        />
      )
    ) : (
      <>
        <BusinessServiceTolerancePanel
          workspaceSlug={workspace.slug}
          businessService={detailQuery.data}
        />
        <BusinessServicePosturePanel businessService={detailQuery.data} />
      </>
    );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateBusinessServices('title')}
        description={translateBusinessServices('description')}
        actions={<NewBusinessServiceAction />}
      />
      <ServicesAreaNavigation current="business" />
      {listQuery.data.length === 0 ? (
        <EmptyState
          kind="first-use"
          title={translateBusinessServices('list.emptyTitle')}
          description={translateBusinessServices('list.emptyDescription')}
        />
      ) : (
        <div
          className={
            showsThreeColumns
              ? 'grid grid-cols-[minmax(17rem,320px)_minmax(0,1fr)_minmax(15rem,270px)] items-start gap-6'
              : 'flex flex-col gap-6'
          }
        >
          {listPanel}
          {detailColumns}
        </div>
      )}
    </div>
  );
}
