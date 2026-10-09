import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_RETURN_PATH, safeReturnPath, signInUrlFor } from './return-path';

describe('safeReturnPath', () => {
  it('keeps a path inside the console', () => {
    expect(safeReturnPath('/w/payments-uk/incidents/INC-2041')).toBe(
      '/w/payments-uk/incidents/INC-2041',
    );
  });

  it.each([
    ['missing', null],
    ['another site', 'https://example.com/phish'],
    ['protocol-relative', '//example.com'],
    ['backslash trick', '/\\example.com'],
    ['relative', 'w/payments-uk'],
  ])('falls back to the default for a %s destination', (_, requestedPath) => {
    expect(safeReturnPath(requestedPath)).toBe(DEFAULT_RETURN_PATH);
  });
});

describe('signInUrlFor', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is unavailable until the identity provider entry point is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_RELYXUS_SIGN_IN_URL', '');
    expect(signInUrlFor('/w/payments-uk/home')).toBeNull();
  });

  it('passes the return path to the configured entry point', () => {
    vi.stubEnv('NEXT_PUBLIC_RELYXUS_SIGN_IN_URL', '/api/auth/sign-in');
    expect(signInUrlFor('/w/payments-uk/home')).toBe(
      '/api/auth/sign-in?returnTo=%2Fw%2Fpayments-uk%2Fhome',
    );
  });
});
