import { vi } from 'vitest';

/*
 * Routes `fetch` calls in component tests to fixture responses, so screens run through the
 * real HTTP client and its contract validation. Unknown requests fail the test loudly.
 */

export type StubbedApiRoute = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Full path, for example "/api/v1/workspaces/payments-uk/incidents/INC-2041". */
  pathname: string;
  status?: number;
  /** Evaluated per request, so a route can reflect state changed by an earlier request. */
  respond: () => unknown;
};

export function stubApi(routes: readonly StubbedApiRoute[]) {
  const fetchMock = vi.fn<typeof fetch>(async (input, init) => {
    const { pathname } = new URL(String(input), 'http://localhost');
    const method = init?.method ?? 'GET';
    const route = routes.find(
      (candidate) => (candidate.method ?? 'GET') === method && candidate.pathname === pathname,
    );
    if (route === undefined) {
      throw new Error(`No API stub for ${method} ${pathname}`);
    }
    const status = route.status ?? 200;
    return new Response(JSON.stringify(route.respond()), {
      status,
      headers: { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json' },
    });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** A WebSocket that opens on the next tick, so the live connection reports itself connected. */
export class OpeningWebSocketStub {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor() {
    setTimeout(() => this.onopen?.(new Event('open')), 0);
  }

  close(): void {}
}
