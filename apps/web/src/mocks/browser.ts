import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

/* DEVELOPMENT ONLY. Loaded dynamically by ApiMockingBoundary when mocking is enabled. */
const mockServiceWorker = setupWorker(...handlers);

let workerStarted: Promise<unknown> | undefined;

/** Warns only about API calls without a fixture; page, asset and Next.js requests pass through. */
function warnAboutUnmockedApiRequest(request: Request, print: { warning: () => void }): void {
  if (new URL(request.url).pathname.startsWith('/api/')) {
    print.warning();
  }
}

/**
 * Starts the worker once per page. React Strict Mode runs effects twice in development, and
 * the worker refuses a second start.
 */
export function startMockServiceWorker(): Promise<unknown> {
  workerStarted ??= mockServiceWorker.start({
    onUnhandledRequest: warnAboutUnmockedApiRequest,
    quiet: true,
  });
  return workerStarted;
}
