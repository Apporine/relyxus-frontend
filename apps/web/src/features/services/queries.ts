'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';

import {
  businessServiceAtRiskListSchema,
  businessServiceDetailSchema,
  businessServiceListSchema,
  serviceConfirmationResponseSchema,
  serviceDependenciesSchema,
  serviceDetailSchema,
  serviceSummaryListSchema,
} from './model';

export const businessServiceHealthEvents = ['business-service.health-changed.v1'] as const;
export const serviceCatalogueEvents = [
  'service.changed.v1',
  'service.health-changed.v1',
  'service.dependencies-changed.v1',
] as const;

export const serviceQueryKeys = {
  businessServices: (workspaceSlug: string) =>
    ['workspaces', workspaceSlug, 'business-services'] as const,
  businessServicesAtRisk: (workspaceSlug: string) =>
    [...serviceQueryKeys.businessServices(workspaceSlug), 'at-risk'] as const,
  businessServiceList: (workspaceSlug: string) =>
    [...serviceQueryKeys.businessServices(workspaceSlug), 'list'] as const,
  businessServiceDetail: (workspaceSlug: string, businessServiceId: string) =>
    [...serviceQueryKeys.businessServices(workspaceSlug), 'detail', businessServiceId] as const,
  catalogue: (workspaceSlug: string) => ['workspaces', workspaceSlug, 'services'] as const,
  list: (workspaceSlug: string, searchText: string) =>
    [...serviceQueryKeys.catalogue(workspaceSlug), 'list', searchText] as const,
  detail: (workspaceSlug: string, serviceId: string) =>
    [...serviceQueryKeys.catalogue(workspaceSlug), 'detail', serviceId] as const,
  dependencies: (workspaceSlug: string, serviceId: string) =>
    [...serviceQueryKeys.catalogue(workspaceSlug), 'dependencies', serviceId] as const,
};

function businessServicesPath(workspaceSlug: string): string {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}/business-services`;
}

function servicesPath(workspaceSlug: string): string {
  return `/workspaces/${encodeURIComponent(workspaceSlug)}/services`;
}

function servicePath(workspaceSlug: string, serviceId: string): string {
  return `${servicesPath(workspaceSlug)}/${encodeURIComponent(serviceId)}`;
}

/** Business services that are not healthy, most severe first. */
export function useBusinessServicesAtRisk(workspaceSlug: string) {
  return useQuery({
    queryKey: serviceQueryKeys.businessServicesAtRisk(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: businessServicesPath(workspaceSlug),
          query: { health: 'not-healthy' },
          responseSchema: businessServiceAtRiskListSchema,
          signal,
        })
      ).data.items,
  });
}

/** The service catalogue, searched on the server so it scales past 1,000 services. */
export function useServiceCatalogue(workspaceSlug: string, searchText: string) {
  return useQuery({
    queryKey: serviceQueryKeys.list(workspaceSlug, searchText),
    // Keeps the current list on screen while the next search result loads.
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: servicesPath(workspaceSlug),
          query: searchText === '' ? undefined : { search: searchText },
          responseSchema: serviceSummaryListSchema,
          signal,
        })
      ).data.items,
  });
}

export function useServiceDetail(workspaceSlug: string, serviceId: string | null) {
  return useQuery({
    queryKey: serviceQueryKeys.detail(workspaceSlug, serviceId ?? ''),
    enabled: serviceId !== null,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: servicePath(workspaceSlug, serviceId ?? ''),
          responseSchema: serviceDetailSchema,
          signal,
        })
      ).data,
  });
}

export function useServiceDependencies(workspaceSlug: string, serviceId: string | null) {
  return useQuery({
    queryKey: serviceQueryKeys.dependencies(workspaceSlug, serviceId ?? ''),
    enabled: serviceId !== null,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${servicePath(workspaceSlug, serviceId ?? '')}/dependencies`,
          responseSchema: serviceDependenciesSchema,
          signal,
        })
      ).data,
  });
}

/** A person confirms a discovered service before it enters the catalogue (Product s. 7). */
export function useConfirmService(workspaceSlug: string, serviceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (idempotencyKey: string) =>
      (
        await requestApi({
          method: 'POST',
          path: `${servicePath(workspaceSlug, serviceId)}/confirmation`,
          idempotencyKey,
          responseSchema: serviceConfirmationResponseSchema,
        })
      ).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: serviceQueryKeys.catalogue(workspaceSlug) }),
  });
}

/** Every important business service with its tolerance, for the resilience view. */
export function useBusinessServices(workspaceSlug: string) {
  return useQuery({
    queryKey: serviceQueryKeys.businessServiceList(workspaceSlug),
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: businessServicesPath(workspaceSlug),
          responseSchema: businessServiceListSchema,
          signal,
        })
      ).data.items,
  });
}

export function useBusinessServiceDetail(workspaceSlug: string, businessServiceId: string | null) {
  return useQuery({
    queryKey: serviceQueryKeys.businessServiceDetail(workspaceSlug, businessServiceId ?? ''),
    enabled: businessServiceId !== null,
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `${businessServicesPath(workspaceSlug)}/${encodeURIComponent(businessServiceId ?? '')}`,
          responseSchema: businessServiceDetailSchema,
          signal,
        })
      ).data,
  });
}
