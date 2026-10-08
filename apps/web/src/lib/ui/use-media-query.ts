'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Whether a CSS media query matches. Server rendering and hydration assume it does not, so
 * layouts start in their compact form and widen once the browser reports its size.
 */
export function useMediaQuery(mediaQuery: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(mediaQuery);
      mediaQueryList.addEventListener('change', onChange);
      return () => mediaQueryList.removeEventListener('change', onChange);
    },
    [mediaQuery],
  );
  const readMatches = useCallback(() => window.matchMedia(mediaQuery).matches, [mediaQuery]);
  return useSyncExternalStore(subscribe, readMatches, () => false);
}
