import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { ApiError } from './api-error';
import { requestApi } from './http-client';

const incidentSchema = z.object({ id: z.string(), title: z.string() });

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
}

function problemResponse(status: number, problem: object, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(problem), {
    status,
    headers: { 'Content-Type': 'application/problem+json', ...headers },
  });
}

async function captureApiError(request: Promise<unknown>): Promise<ApiError> {
  const error = await request.then(
    () => undefined,
    (rejection: unknown) => rejection,
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

describe('requestApi', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('validates the response and returns its ETag', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { id: 'INC-2041', title: 'Card authorisation failures in UK' },
        { headers: { ETag: '"v7"' } },
      ),
    );

    const response = await requestApi({
      path: '/workspaces/payments-uk/incidents/INC-2041',
      responseSchema: incidentSchema,
    });

    expect(response).toEqual({
      data: { id: 'INC-2041', title: 'Card authorisation failures in UK' },
      etag: '"v7"',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/workspaces/payments-uk/incidents/INC-2041',
      expect.objectContaining({ method: 'GET', credentials: 'same-origin' }),
    );
  });

  it('sends query parameters, idempotency key and If-Match', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'INC-2041', title: 'Renamed' }));

    await requestApi({
      method: 'PATCH',
      path: '/workspaces/payments-uk/incidents/INC-2041',
      query: { severity: ['SEV1', 'SEV2'], cursor: undefined, limit: 50 },
      body: { title: 'Renamed' },
      responseSchema: incidentSchema,
      idempotencyKey: 'b6f1c1a0-1f6e-4b8e-9a51-6b1f2c3d4e5f',
      ifMatch: '"v7"',
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      '/api/v1/workspaces/payments-uk/incidents/INC-2041?severity=SEV1&severity=SEV2&limit=50',
    );
    const headers = new Headers(init?.headers);
    expect(headers.get('Idempotency-Key')).toBe('b6f1c1a0-1f6e-4b8e-9a51-6b1f2c3d4e5f');
    expect(headers.get('If-Match')).toBe('"v7"');
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(init?.body).toBe('{"title":"Renamed"}');
  });

  it('classifies problem details and keeps the correlation ID', async () => {
    fetchMock.mockResolvedValue(
      problemResponse(403, { title: 'Missing role', status: 403, correlationId: 'RX-7F2A' }),
    );

    const error = await captureApiError(
      requestApi({ path: '/workspaces/payments-uk/compliance', responseSchema: z.unknown() }),
    );

    expect(error.kind).toBe('forbidden');
    expect(error.correlationId).toBe('RX-7F2A');
    expect(error.isRetryable).toBe(false);
  });

  it('treats a stale If-Match as a precondition failure', async () => {
    fetchMock.mockResolvedValue(problemResponse(412, { title: 'Changed by someone else' }));

    const error = await captureApiError(
      requestApi({
        method: 'PATCH',
        path: '/x',
        body: {},
        ifMatch: '"v6"',
        responseSchema: z.unknown(),
      }),
    );

    expect(error.kind).toBe('precondition-failed');
  });

  it('reads Retry-After on rate limiting', async () => {
    fetchMock.mockResolvedValue(
      problemResponse(429, { title: 'Too many requests' }, { 'Retry-After': '12' }),
    );

    const error = await captureApiError(requestApi({ path: '/x', responseSchema: z.unknown() }));

    expect(error.kind).toBe('rate-limited');
    expect(error.retryAfterSeconds).toBe(12);
    expect(error.isRetryable).toBe(true);
  });

  it('reports a network failure as retryable', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const error = await captureApiError(requestApi({ path: '/x', responseSchema: z.unknown() }));

    expect(error.kind).toBe('network');
    expect(error.isRetryable).toBe(true);
  });

  it('rejects a response that breaks the contract without echoing its values', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 42, title: 'Secret customer detail' }));

    const error = await captureApiError(requestApi({ path: '/x', responseSchema: incidentSchema }));

    expect(error.kind).toBe('contract');
    expect(error.message).toContain('id');
    expect(error.message).not.toContain('Secret customer detail');
  });

  it('accepts an empty 204 response', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const response = await requestApi({
      method: 'DELETE',
      path: '/x',
      responseSchema: z.undefined(),
    });

    expect(response.data).toBeUndefined();
  });
});
