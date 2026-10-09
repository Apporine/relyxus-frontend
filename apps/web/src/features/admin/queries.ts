'use client';

import { useQuery } from '@tanstack/react-query';

import { requestApi } from '@/lib/api/http-client';
import { createListDetailQueries } from '@/lib/api/list-detail-queries';

import {
  platformOperationsSchema,
  promotionDetailSchema,
  promotionListSchema,
  securitySectionDetailSchema,
  securitySectionListSchema,
  statusPageDetailSchema,
  statusPageListSchema,
  supportSessionDetailSchema,
  supportSessionListSchema,
  userDetailSchema,
  userListSchema,
} from './model';

export const statusPageQueries = createListDetailQueries('settings/status-pages', {
  list: statusPageListSchema,
  detail: statusPageDetailSchema,
});

export const promotionQueries = createListDetailQueries('settings/promotions', {
  list: promotionListSchema,
  detail: promotionDetailSchema,
});

export const supportSessionQueries = createListDetailQueries('settings/support-sessions', {
  list: supportSessionListSchema,
  detail: supportSessionDetailSchema,
});

export const userQueries = createListDetailQueries('settings/users', {
  list: userListSchema,
  detail: userDetailSchema,
});

export const securitySectionQueries = createListDetailQueries('settings/security', {
  list: securitySectionListSchema,
  detail: securitySectionDetailSchema,
});

export function usePlatformOperations(workspaceSlug: string) {
  return useQuery({
    queryKey: ['workspaces', workspaceSlug, 'settings/platform'],
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: `/workspaces/${encodeURIComponent(workspaceSlug)}/settings/platform`,
          responseSchema: platformOperationsSchema,
          signal,
        })
      ).data,
  });
}
