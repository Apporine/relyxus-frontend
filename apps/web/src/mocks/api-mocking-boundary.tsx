'use client';

import { useEffect, useState, type ReactNode } from 'react';

/*
 * Mock Service Worker serves the provisional API in development so screens can be built
 * before the backend exists (UI/UX s. 19). It is on by default in `next dev` and can be
 * turned off with NEXT_PUBLIC_RELYXUS_API_MOCKING=disabled to point at a real API. Production
 * builds compile this condition to false, so the worker is never loaded or registered there.
 */
const isApiMockingEnabled =
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_RELYXUS_API_MOCKING !== 'disabled';

/** Holds rendering until the mock worker is intercepting requests, so no request escapes it. */
export function ApiMockingBoundary({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(!isApiMockingEnabled);

  useEffect(() => {
    if (!isApiMockingEnabled) {
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
  }, []);

  return isReady ? children : null;
}
