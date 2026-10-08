'use client';

import { useToast } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { ApiError } from '@/lib/api/api-error';
import { useCanChangeState } from '@/lib/live/live-updates-provider';

import type { IncidentDetail } from './model';
import { useAcknowledgeIncident } from './queries';

export type AcknowledgeIncidentAction = {
  /** False once acknowledged, and while the live connection is down (UI/UX s. 8). */
  canAcknowledge: boolean;
  isAcknowledging: boolean;
  acknowledge: () => void;
};

/** Acknowledge from the header button or the A shortcut, with the same rules and feedback. */
export function useAcknowledgeIncidentAction(
  workspaceSlug: string,
  incident: IncidentDetail | undefined,
): AcknowledgeIncidentAction {
  const translateHeader = useTranslations('warRoom.header');
  const translateCommon = useTranslations('common');
  const { showToast } = useToast();
  const canChangeState = useCanChangeState();
  const acknowledgeMutation = useAcknowledgeIncident(workspaceSlug, incident?.reference ?? '');
  const canAcknowledge =
    incident !== undefined &&
    incident.acknowledgement === null &&
    canChangeState &&
    !acknowledgeMutation.isPending;

  function acknowledge() {
    if (!canAcknowledge) {
      return;
    }
    acknowledgeMutation.mutate(undefined, {
      onSuccess: () => showToast({ tone: 'success', title: translateHeader('acknowledgedToast') }),
      onError: (error) =>
        showToast({
          tone: 'error',
          title: translateHeader('acknowledgeFailed'),
          description: translateHeader('acknowledgeFailedDetail', {
            reference:
              error instanceof ApiError && error.correlationId !== undefined
                ? error.correlationId
                : translateCommon('notReported'),
          }),
        }),
    });
  }

  return { canAcknowledge, isAcknowledging: acknowledgeMutation.isPending, acknowledge };
}
