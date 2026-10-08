import { describe, expect, it } from 'vitest';

import { ApiError } from './api-error';
import { queryRetryDelayMs, shouldRetryQuery } from './query-client';

const networkFailure = new ApiError({ kind: 'network', message: 'offline' });
const forbidden = new ApiError({ kind: 'forbidden', message: 'missing role', status: 403 });

describe('shouldRetryQuery', () => {
  it('retries transient failures twice', () => {
    expect(shouldRetryQuery(0, networkFailure)).toBe(true);
    expect(shouldRetryQuery(1, networkFailure)).toBe(true);
    expect(shouldRetryQuery(2, networkFailure)).toBe(false);
  });

  it('never retries answers that will not change', () => {
    expect(shouldRetryQuery(0, forbidden)).toBe(false);
    expect(shouldRetryQuery(0, new Error('unexpected'))).toBe(false);
  });
});

describe('queryRetryDelayMs', () => {
  it('honours Retry-After', () => {
    const rateLimited = new ApiError({
      kind: 'rate-limited',
      message: 'slow down',
      retryAfterSeconds: 12,
    });
    expect(queryRetryDelayMs(0, rateLimited)).toBe(12_000);
  });

  it('backs off exponentially up to eight seconds', () => {
    expect(queryRetryDelayMs(0, networkFailure)).toBe(1_000);
    expect(queryRetryDelayMs(1, networkFailure)).toBe(2_000);
    expect(queryRetryDelayMs(5, networkFailure)).toBe(8_000);
  });
});
