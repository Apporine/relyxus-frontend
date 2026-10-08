import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './api-error';

const MAX_QUERY_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 8_000;
const QUERY_STALE_TIME_MS = 30_000;

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  return error instanceof ApiError && error.isRetryable && failureCount < MAX_QUERY_RETRIES;
}

export function queryRetryDelayMs(attemptIndex: number, error: unknown): number {
  if (error instanceof ApiError && error.retryAfterSeconds !== undefined) {
    return error.retryAfterSeconds * 1_000;
  }
  return Math.min(BASE_RETRY_DELAY_MS * 2 ** attemptIndex, MAX_RETRY_DELAY_MS);
}

/*
 * Live data arrives over the live connection, so queries do not refetch when the window
 * regains focus: a background refetch could reorder what the person is reading. Mutations
 * are never retried automatically; acting twice on production is never a transport detail.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: shouldRetryQuery,
        retryDelay: queryRetryDelayMs,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
