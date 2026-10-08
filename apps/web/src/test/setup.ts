import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// jsdom has no layout engine; media queries report "no match", like a narrow viewport.
if (typeof window !== 'undefined' && window.matchMedia === undefined) {
  window.matchMedia = (mediaQuery: string) =>
    ({
      matches: false,
      media: mediaQuery,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) satisfies MediaQueryList;
}
