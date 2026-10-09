'use client';

import { Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ListDetailLayout } from './list-detail-layout';
import { PageLoadingState } from './page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from './page-states';

type ListDetailContentProps<Item, Detail> = {
  listQuery: UseQueryResult<Item[]>;
  detailQuery: UseQueryResult<Detail>;
  selectedId: string | null;
  /** Names the page in its failure message, for example "Policies". */
  sectionName: string;
  detailSectionName: string;
  renderList: (items: Item[]) => ReactNode;
  renderDetail: (detail: Detail) => ReactNode;
  renderAside?: (detail: Detail) => ReactNode;
};

/**
 * The states of a list and detail screen (UI/UX s. 9): page loading, page failure, and a
 * detail that is loading, failed, or hidden. A hidden and a missing item look the same.
 */
export function ListDetailContent<Item, Detail>({
  listQuery,
  detailQuery,
  selectedId,
  sectionName,
  detailSectionName,
  renderList,
  renderDetail,
  renderAside,
}: ListDetailContentProps<Item, Detail>) {
  if (listQuery.isPending) {
    return <PageLoadingState />;
  }
  if (listQuery.isError) {
    return (
      <PageLoadFailedState
        error={listQuery.error}
        sectionName={sectionName}
        onRetry={() => void listQuery.refetch()}
      />
    );
  }

  let detail: ReactNode = null;
  let aside: ReactNode = null;
  if (selectedId !== null) {
    if (detailQuery.isPending) {
      detail = <Skeleton aria-busy="true" className="h-[32rem] w-full" />;
    } else if (detailQuery.isError) {
      detail = isHiddenOrMissing(detailQuery.error) ? (
        <NoAccessState />
      ) : (
        <PageLoadFailedState
          error={detailQuery.error}
          sectionName={detailSectionName}
          onRetry={() => void detailQuery.refetch()}
        />
      );
    } else {
      detail = renderDetail(detailQuery.data);
      aside = renderAside?.(detailQuery.data) ?? null;
    }
  }

  return <ListDetailLayout list={renderList(listQuery.data)} detail={detail} aside={aside} />;
}
