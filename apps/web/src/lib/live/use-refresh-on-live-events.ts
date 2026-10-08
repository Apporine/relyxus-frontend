'use client';

import { useQueryClient, type QueryKey } from '@tanstack/react-query';

import { useLiveEvents } from './live-updates-provider';

/**
 * Re-reads a query whenever one of the given live events arrives. The event only signals
 * that something changed; the API remains the source of truth for the new state.
 */
export function useRefreshOnLiveEvents(eventTypes: readonly string[], queryKey: QueryKey): void {
  const queryClient = useQueryClient();
  useLiveEvents(eventTypes, () => {
    void queryClient.invalidateQueries({ queryKey });
  });
}
