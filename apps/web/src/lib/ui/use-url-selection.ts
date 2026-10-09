'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

/**
 * The selected item of a list and detail screen, kept in the URL so links reopen it
 * (UI/UX s. 7). Without a selection the first item is chosen once the list has loaded.
 */
export function useUrlSelection(
  parameterName: string,
  availableIds: readonly string[] | undefined,
): { selectedId: string | null; hrefFor: (id: string) => Route } {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get(parameterName);
  const hasRequestedId = requestedId !== null && requestedId !== '';
  const selectedId = hasRequestedId ? requestedId : (availableIds?.[0] ?? null);

  const hrefFor = useCallback(
    (id: string) => {
      const nextParameters = new URLSearchParams(searchParams.toString());
      nextParameters.set(parameterName, id);
      return `${pathname}?${nextParameters.toString()}` as Route;
    },
    [parameterName, pathname, searchParams],
  );

  useEffect(() => {
    if (availableIds === undefined || hasRequestedId || selectedId === null) {
      return;
    }
    router.replace(hrefFor(selectedId), { scroll: false });
  }, [availableIds, hasRequestedId, hrefFor, router, selectedId]);

  return { selectedId, hrefFor };
}
