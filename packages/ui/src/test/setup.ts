import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

const isDomEnvironment = typeof Element !== 'undefined';

if (isDomEnvironment) {
  afterEach(() => {
    cleanup();
  });

  // jsdom does not implement the pointer-capture and scrolling APIs that Radix primitives
  // call while handling keyboard and pointer interaction.
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
    Element.prototype.releasePointerCapture = () => undefined;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined;
  }
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class ResizeObserverStub {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
  }
}
