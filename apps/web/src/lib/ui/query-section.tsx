'use client';

import { Button } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { Lock, OctagonAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { ApiError } from '@/lib/api/api-error';

type QuerySectionProps<Data> = {
  query: UseQueryResult<Data>;
  /** Names the section in state messages, for example "Active incidents". */
  sectionName: string;
  /** Skeleton in the shape of the real content (UI/UX s. 9). */
  loadingPlaceholder: ReactNode;
  children: (data: Data) => ReactNode;
};

/**
 * The documented states of one data-backed section: loading in the content's shape, a
 * permission message that names no hidden data, and a failure with its reference and a safe
 * retry. Each section fails on its own so one broken card never blanks a whole screen.
 */
export function QuerySection<Data>({
  query,
  sectionName,
  loadingPlaceholder,
  children,
}: QuerySectionProps<Data>) {
  const translateCommon = useTranslations('common');

  if (query.isPending) {
    return (
      <div aria-busy="true">
        <span className="sr-only">{translateCommon('loading', { section: sectionName })}</span>
        {loadingPlaceholder}
      </div>
    );
  }

  if (query.isError) {
    const { error } = query;
    if (error instanceof ApiError && error.kind === 'forbidden') {
      return (
        <p className="flex items-start gap-2 text-body text-fg-secondary">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
          {translateCommon('sectionForbidden', { section: sectionName })}
        </p>
      );
    }
    const reference =
      error instanceof ApiError && error.correlationId !== undefined
        ? error.correlationId
        : translateCommon('notReported');
    return (
      <div role="alert" className="flex flex-col items-start gap-2">
        <p className="flex items-start gap-2 text-body font-semibold text-fg-primary">
          <OctagonAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" />
          {translateCommon('sectionLoadFailed', { section: sectionName })}
        </p>
        <p className="text-meta text-fg-secondary">
          {translateCommon('sectionLoadFailedReference', { reference })}
        </p>
        <Button size="small" onClick={() => void query.refetch()}>
          {translateCommon('retry')}
        </Button>
      </div>
    );
  }

  return children(query.data);
}
