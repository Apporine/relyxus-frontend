'use client';

import { Button } from '@relyxus/ui';
import { Lock, OctagonAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { ApiError } from '@/lib/api/api-error';

import { FullPageMessage } from './full-page-message';

export function WorkspaceLoadingState() {
  const translateStates = useTranslations('shell.states');
  return <FullPageMessage isBusy title={translateStates('loadingWorkspace')} />;
}

/** Plain-language failure with a reference ID and a safe retry (UI/UX s. 9). */
export function SessionErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const translateStates = useTranslations('shell.states');
  const reference =
    error instanceof ApiError && error.correlationId !== undefined
      ? error.correlationId
      : translateStates('notReported');

  return (
    <FullPageMessage
      icon={<OctagonAlert aria-hidden className="size-6 text-critical" />}
      title={translateStates('sessionUnavailableTitle')}
      description={translateStates('sessionUnavailableDescription', { reference })}
      action={
        <Button variant="primary" onClick={onRetry}>
          {translateStates('retry')}
        </Button>
      }
    />
  );
}

/**
 * Shown for a workspace that does not exist and for one the person may not enter, with the
 * same words, so the page never confirms that a hidden workspace exists.
 */
export function WorkspaceUnavailableState() {
  const translateStates = useTranslations('shell.states');
  return (
    <FullPageMessage
      icon={<Lock aria-hidden className="size-6 text-fg-secondary" />}
      title={translateStates('workspaceUnavailableTitle')}
      description={translateStates('workspaceUnavailableDescription')}
    />
  );
}

export function NoWorkspacesState() {
  const translateStates = useTranslations('shell.states');
  return (
    <FullPageMessage
      icon={<Lock aria-hidden className="size-6 text-fg-secondary" />}
      title={translateStates('noWorkspacesTitle')}
      description={translateStates('noWorkspacesDescription')}
    />
  );
}
