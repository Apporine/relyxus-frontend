'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { newIdempotencyKey, requestApi } from '@/lib/api/http-client';

import type { DeclareIncidentFormState } from './declare-incident-form-state';
import {
  declareIncidentRequestSchema,
  declareIncidentResponseSchema,
  incidentTypeListSchema,
  type DeclareIncidentRequest,
} from './declaration-model';
import { incidentQueryKeys } from './queries';

export const declarationQueryKeys = {
  incidentTypes: (workspaceSlug: string) =>
    ['workspaces', workspaceSlug, 'incident-types'] as const,
};

/** Incident types configured for the workspace declaration wizard. */
export function useIncidentTypes(workspaceSlug: string) {
  return useQuery({
    queryKey: declarationQueryKeys.incidentTypes(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/incident-types`,
          responseSchema: incidentTypeListSchema,
          signal,
        })
      ).data.items,
  });
}

function parseOptionalCount(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Maps the wizard form into the provisional declare-incident contract. */
export function declareIncidentRequestFromForm(
  formState: DeclareIncidentFormState,
): DeclareIncidentRequest {
  const moneyMajor = formState.moneyAmountMajor.trim();
  const failedTransactions = parseOptionalCount(formState.failedTransactions);
  const affectedCustomers = parseOptionalCount(formState.affectedCustomers);

  const hasImpact = moneyMajor !== '' || failedTransactions !== null || affectedCustomers !== null;

  const request = {
    incidentTypeId: formState.incidentTypeId,
    title: formState.title.trim(),
    businessServiceIds: formState.businessServiceIds,
    technicalComponent:
      formState.technicalComponent.trim() === '' ? undefined : formState.technicalComponent.trim(),
    severity: formState.severity,
    visibility: formState.visibility,
    context: formState.context.trim() === '' ? undefined : formState.context.trim(),
    impact: hasImpact
      ? {
          moneyAtRisk:
            moneyMajor === ''
              ? null
              : {
                  amountInMinorUnits: Math.round(Number.parseFloat(moneyMajor) * 100),
                  currencyCode: 'GBP',
                  confidence: 'estimated' as const,
                },
          failedTransactions,
          affectedCustomers,
        }
      : undefined,
  };

  return declareIncidentRequestSchema.parse(request);
}

export function useDeclareIncident(workspaceSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formState: DeclareIncidentFormState) =>
      (
        await requestApi({
          method: 'POST',
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/incidents`,
          body: declareIncidentRequestFromForm(formState),
          responseSchema: declareIncidentResponseSchema,
          idempotencyKey: newIdempotencyKey(),
        })
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceSlug, 'incidents'] });
      await queryClient.invalidateQueries({ queryKey: incidentQueryKeys.summary(workspaceSlug) });
    },
  });
}
