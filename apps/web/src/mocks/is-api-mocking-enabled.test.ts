import { afterEach, describe, expect, it, vi } from 'vitest';

import { isApiMockingEnabled } from './is-api-mocking-enabled';

describe('isApiMockingEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is on in development when the public flag is unset', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_RELYXUS_API_MOCKING', undefined);
    expect(isApiMockingEnabled()).toBe(true);
  });

  it('is off in production when the public flag is unset', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_RELYXUS_API_MOCKING', undefined);
    expect(isApiMockingEnabled()).toBe(false);
  });

  it('is on in production when explicitly enabled for demo hosts', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_RELYXUS_API_MOCKING', 'enabled');
    expect(isApiMockingEnabled()).toBe(true);
  });

  it('is off in development when explicitly disabled', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_RELYXUS_API_MOCKING', 'disabled');
    expect(isApiMockingEnabled()).toBe(false);
  });
});
