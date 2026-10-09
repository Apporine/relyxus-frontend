import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';
import {
  platformOperationsFixture,
  promotionFixtures,
  securitySectionFixtures,
  statusPageFixtures,
  supportSessionFixtures,
  userFixtures,
} from '@/mocks/fixtures/admin-fixtures';
import { navigationState } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';
import { OpeningWebSocketStub, stubApi, type StubbedApiRoute } from '@/test/stub-api';

import { PlatformOperationsPage } from './platform-operations-page';
import { PromotionPage } from './promotion-page';
import { SecurityPage } from './security-page';
import { StatusPagesPage } from './status-pages-page';
import { SupportAccessPage } from './support-access-page';
import { UsersPage } from './users-page';

// The pages import next/navigation before the helper above loads, so the factory imports it.
vi.mock(
  'next/navigation',
  async () => (await import('@/test/next-navigation-mock')).nextNavigationMock,
);

const SETTINGS_PATH = '/api/v1/workspaces/payments-uk/settings';

function collectionRoutes<Detail extends { id: string }>(
  resource: string,
  details: Detail[],
): StubbedApiRoute[] {
  return [
    {
      pathname: `${SETTINGS_PATH}/${resource}`,
      respond: () => ({ items: details, nextCursor: null }),
    },
    ...details.map((detail) => ({
      pathname: `${SETTINGS_PATH}/${resource}/${detail.id}`,
      respond: () => detail,
    })),
  ];
}

function renderPage(page: React.ReactElement, searchParameters = '') {
  navigationState.currentSearchParams = new URLSearchParams(searchParameters);
  return renderInWorkspace(
    <LiveUpdatesProvider workspaceSlug="payments-uk">{page}</LiveUpdatesProvider>,
  );
}

function panelNamed(heading: string) {
  return screen.getByRole('heading', { name: heading }).closest('section') as HTMLElement;
}

beforeEach(() => {
  vi.stubGlobal('WebSocket', OpeningWebSocketStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('StatusPagesPage', () => {
  it('previews the draft and how many subscribers will be told', async () => {
    stubApi(collectionRoutes('status-pages', statusPageFixtures()));
    renderPage(<StatusPagesPage />, 'page=status-public');

    expect(await screen.findByText('Card payments degraded')).toBeInTheDocument();
    expect(panelNamed('Live preview')).toHaveTextContent('12,480 subscribers will be notified');
    expect(screen.getByRole('navigation', { name: 'Admin views' })).toBeInTheDocument();
  });
});

describe('PromotionPage', () => {
  it('lists every difference and flags destructive changes', async () => {
    stubApi(collectionRoutes('promotions', promotionFixtures));
    renderPage(<PromotionPage />, 'plan=promotion-payments-staging-to-production');

    expect(
      await screen.findByText('4 added · 11 changed · 2 deleted · 6 secrets omitted'),
    ).toBeInTheDocument();
    expect(panelNamed('Validation')).toHaveTextContent('2 destructive changes');
  });
});

describe('PlatformOperationsPage', () => {
  it('shows health, system checks and the available update', async () => {
    stubApi([{ pathname: `${SETTINGS_PATH}/platform`, respond: platformOperationsFixture }]);
    renderPage(<PlatformOperationsPage />);

    expect(await screen.findByText('Healthy · 6 nodes')).toBeInTheDocument();
    expect(screen.getByText('Warning · 18 days left')).toBeInTheDocument();
    expect(panelNamed('Available update')).toHaveTextContent('2.9.0');
  });
});

describe('SupportAccessPage', () => {
  it('explains why a support session was denied', async () => {
    stubApi(collectionRoutes('support-sessions', supportSessionFixtures()));
    renderPage(<SupportAccessPage />, 'session=session-8812');

    expect(
      await screen.findByText('Scope too broad: incident content is never shared with support'),
    ).toBeInTheDocument();
    expect(panelNamed('Live control')).toHaveTextContent('Immediate');
  });
});

describe('UsersPage', () => {
  it('flags an overdue access review on a suspended user', async () => {
    stubApi(collectionRoutes('users', userFixtures));
    renderPage(<UsersPage />, 'user=user-t-evans');

    const controls = await waitForPanel('Access controls');
    expect(within(controls).getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Never signed in')).toBeInTheDocument();
  });
});

describe('SecurityPage', () => {
  it('shows model and region settings with the data flow preview', async () => {
    stubApi(collectionRoutes('security', securitySectionFixtures));
    renderPage(<SecurityPage />, 'section=models-regions');

    expect(await screen.findByText('United Kingdom only')).toBeInTheDocument();
    expect(screen.getByText('External model egress')).toBeInTheDocument();
    expect(panelNamed('Data flow preview')).toHaveTextContent('Named users only');
  });
});

async function waitForPanel(heading: string) {
  return (await screen.findByRole('heading', { name: heading })).closest('section') as HTMLElement;
}
