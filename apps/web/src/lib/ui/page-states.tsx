'use client';

import { Button } from '@relyxus/ui';
import { Lock, OctagonAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ApiError } from '@/lib/api/api-error';

/**
 * Shown for an item the person may not open and for one that does not exist, with the same
 * words, so a page never confirms that a restricted record exists (Product s. 8A).
 */
export function NoAccessState() {
  const translateNoAccess = useTranslations('common.noAccess');
  return (
    <section className="flex flex-col items-center gap-3 rounded-panel border border-control bg-surface-1 px-8 py-12 text-center">
      <Lock aria-hidden className="size-6 text-fg-secondary" />
      <h1 className="text-section-title font-semibold">{translateNoAccess('title')}</h1>
      <p className="max-w-prose text-body text-fg-secondary">{translateNoAccess('description')}</p>
    </section>
  );
}

/** A page's primary record failed to load: what failed, its reference and a safe retry (UI/UX s. 9). */
export function PageLoadFailedState({
  error,
  sectionName,
  onRetry,
}: {
  error: Error;
  /** Names what failed, for example "Evidence explorer". */
  sectionName: string;
  onRetry: () => void;
}) {
  const translateCommon = useTranslations('common');
  const reference =
    error instanceof ApiError && error.correlationId !== undefined
      ? error.correlationId
      : translateCommon('notReported');

  return (
    <section
      role="alert"
      className="flex flex-col items-start gap-3 rounded-panel border border-critical bg-surface-1 p-6"
    >
      <h1 className="flex items-center gap-2 text-section-title font-semibold">
        <OctagonAlert aria-hidden className="size-5 text-critical" />
        {translateCommon('sectionLoadFailed', { section: sectionName })}
      </h1>
      <p className="text-body text-fg-secondary">
        {translateCommon('sectionLoadFailedReference', { reference })}
      </p>
      <Button onClick={onRetry}>{translateCommon('retry')}</Button>
    </section>
  );
}

/** True for the answers that must render as NoAccessState: forbidden and not found. */
export function isHiddenOrMissing(error: Error): boolean {
  return error instanceof ApiError && (error.kind === 'forbidden' || error.kind === 'not-found');
}
