'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { isApiMockingEnabled } from './is-api-mocking-enabled';

/*
 * Mock Service Worker serves the provisional API while the backend is unavailable (UI/UX
 * s. 19). It is on by default in `next dev`, off in production unless
 * NEXT_PUBLIC_RELYXUS_API_MOCKING=enabled for public demo hosts.
 */

/** Holds rendering until the mock worker is intercepting requests, so no request escapes it. */
export function ApiMockingBoundary({ children }: { children: ReactNode }) {
  const mockingEnabled = isApiMockingEnabled();
  const [isReady, setIsReady] = useState(!mockingEnabled);

  useEffect(() => {
    if (!mockingEnabled) {
      return;
    }
    let isUnmounted = false;
    import('./browser')
      .then(({ startMockServiceWorker }) => startMockServiceWorker())
      .catch((startFailure: unknown) => {
        console.error(
          '[relyxus-mocks] Mock Service Worker did not start; API requests will fail.',
          startFailure,
        );
      })
      .finally(() => {
        if (!isUnmounted) {
          setIsReady(true);
        }
      });
    return () => {
      isUnmounted = true;
    };
  }, [mockingEnabled]);

  return isReady ? children : null;
}
