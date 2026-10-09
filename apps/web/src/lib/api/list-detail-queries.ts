'use client';

import { useQuery } from '@tanstack/react-query';
import type { z } from 'zod';

import { requestApi } from './http-client';

type ListResponseSchema = z.ZodType<{ items: unknown[]; nextCursor: string | null }>;

/**
 * Queries for a workspace collection read as a list plus one detail, the shape of most
 * configuration screens: `GET /workspaces/{slug}/{resource}` and `.../{resource}/{id}`.
 */
export function createListDetailQueries<
  ListSchema extends ListResponseSchema,
  DetailSchema extends z.ZodType,
>(resourcePath: string, schemas: { list: ListSchema; detail: DetailSchema }) {
  const queryKeys = {
    all: (workspaceSlug: string) => ['workspaces', workspaceSlug, resourcePath] as const,
    list: (workspaceSlug: string) => [...queryKeys.all(workspaceSlug), 'list'] as const,
    detail: (workspaceSlug: string, id: string) =>
      [...queryKeys.all(workspaceSlug), 'detail', id] as const,
  };

  function collectionPath(workspaceSlug: string): string {
    return `/workspaces/${encodeURIComponent(workspaceSlug)}/${resourcePath}`;
  }

  function useList(workspaceSlug: string) {
    return useQuery({
      queryKey: queryKeys.list(workspaceSlug),
      queryFn: async ({ signal }) =>
        (
          await requestApi({
            path: collectionPath(workspaceSlug),
            responseSchema: schemas.list,
            signal,
          })
        ).data.items as z.output<ListSchema>['items'],
    });
  }

  function useDetail(workspaceSlug: string, id: string | null) {
    return useQuery({
      queryKey: queryKeys.detail(workspaceSlug, id ?? ''),
      enabled: id !== null,
      queryFn: async ({ signal }) =>
        (
          await requestApi({
            path: `${collectionPath(workspaceSlug)}/${encodeURIComponent(id ?? '')}`,
            responseSchema: schemas.detail,
            signal,
          })
        ).data as z.output<DetailSchema>,
    });
  }

  return { queryKeys, useList, useDetail };
}
