import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SignInPage } from '@/features/identity/sign-in-page';
import { publicTrustDocuments } from '@/mocks/fixtures/trust-fixtures';
import { navigationState } from '@/test/next-navigation-mock';
import { renderWithIntl } from '@/test/render-with-intl';
import { stubApi } from '@/test/stub-api';

import { trustDocumentAction } from './model';
import { PublicTrustCentrePage } from './public-trust-centre-page';

// The pages import next/navigation before the helper above loads, so the factory imports it.
vi.mock(
  'next/navigation',
  async () => (await import('@/test/next-navigation-mock')).nextNavigationMock,
);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('trustDocumentAction', () => {
  it('downloads public material, requests gated material and keeps old versions as history', () => {
    const [isoCertificate, soc2Report] = publicTrustDocuments();
    expect(trustDocumentAction(isoCertificate!)).toBe('download');
    expect(trustDocumentAction(soc2Report!)).toBe('request-access');
    expect(trustDocumentAction({ ...soc2Report!, status: 'superseded' })).toBe('history');
  });
});

describe('PublicTrustCentrePage', () => {
  function stubTrustApi() {
    return stubApi([
      {
        pathname: '/api/v1/trust/documents',
        respond: () => ({ items: publicTrustDocuments(), nextCursor: null }),
      },
      {
        method: 'POST',
        pathname: '/api/v1/trust/documents/doc-soc2/access-requests',
        respond: () => ({ requestId: 'access-doc-soc2' }),
      },
    ]);
  }

  it('lists documents by category without internal material', async () => {
    stubTrustApi();
    renderWithIntl(<PublicTrustCentrePage />);

    const certifications = (await screen.findByRole('heading', { name: 'Certifications' })).closest(
      'section',
    ) as HTMLElement;
    expect(
      within(certifications).getByRole('link', { name: 'Download ISO 27001 certificate' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Legacy architecture')).not.toBeInTheDocument();
  });

  it('requires the NDA before requesting gated material, then confirms the request', async () => {
    const fetchMock = stubTrustApi();
    renderWithIntl(<PublicTrustCentrePage />);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('button', { name: 'Request access to SOC 2 Type II report' }),
    );
    await user.type(screen.getByRole('textbox', { name: /Full name/ }), 'Layla Haddad');
    await user.type(screen.getByRole('textbox', { name: /Work email/ }), 'layla@bank.example');
    await user.type(screen.getByRole('textbox', { name: /Company/ }), 'Example Bank');
    await user.click(screen.getByRole('button', { name: 'Send request' }));

    expect(
      await screen.findByText('Accept the non-disclosure agreement to request this document.'),
    ).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);

    await user.click(screen.getByRole('checkbox', { name: /non-disclosure agreement/ }));
    await user.click(screen.getByRole('button', { name: 'Send request' }));

    expect(await screen.findByText('Request received')).toBeInTheDocument();
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(new Headers(postCall?.[1]?.headers).get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('SignInPage', () => {
  it('explains an ended session and keeps only a safe return path', () => {
    vi.stubEnv('NEXT_PUBLIC_RELYXUS_SIGN_IN_URL', '/api/auth/sign-in');
    navigationState.currentSearchParams = new URLSearchParams(
      'reason=session-expired&returnTo=%2Fw%2Fpayments-uk%2Fincidents%2FINC-2041',
    );
    renderWithIntl(<SignInPage />);

    expect(screen.getByText('Your session ended')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue with your organisation' })).toHaveAttribute(
      'href',
      '/api/auth/sign-in?returnTo=%2Fw%2Fpayments-uk%2Fincidents%2FINC-2041',
    );
  });

  it('is disabled with the reason until sign-in is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_RELYXUS_SIGN_IN_URL', '');
    navigationState.currentSearchParams = new URLSearchParams('returnTo=https://example.com');
    renderWithIntl(<SignInPage />);

    expect(screen.getByRole('button', { name: 'Continue with your organisation' })).toBeDisabled();
    expect(
      screen.getByText('Sign-in is not configured in this environment yet.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('https://example.com')).not.toBeInTheDocument();
  });
});
