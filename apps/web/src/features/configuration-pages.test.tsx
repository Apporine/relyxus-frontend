import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IncidentTypesPage } from '@/features/incident-types/incident-types-page';
import { PoliciesPage } from '@/features/policies/policies-page';
import { RunbooksPage } from '@/features/runbooks/runbooks-page';
import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';
import {
  incidentTypeFixtures,
  policyFixtures,
  runbookFixtures,
} from '@/mocks/fixtures/configuration-fixtures';
import { navigationState, routerMock } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';
import { OpeningWebSocketStub, stubApi } from '@/test/stub-api';

// The pages import next/navigation before the helper above loads, so the factory imports it.
vi.mock(
  'next/navigation',
  async () => (await import('@/test/next-navigation-mock')).nextNavigationMock,
);

const WORKSPACE_PATH = '/api/v1/workspaces/payments-uk';

function stubCollection<Detail extends { id: string }>(resource: string, details: Detail[]) {
  return details.flatMap((detail, index) => [
    ...(index === 0
      ? [
          {
            pathname: `${WORKSPACE_PATH}/${resource}`,
            respond: () => ({ items: details, nextCursor: null }),
          },
        ]
      : []),
    { pathname: `${WORKSPACE_PATH}/${resource}/${detail.id}`, respond: () => detail },
  ]);
}

function renderPage(page: React.ReactElement, searchParameters = '') {
  navigationState.currentSearchParams = new URLSearchParams(searchParameters);
  return renderInWorkspace(
    <LiveUpdatesProvider workspaceSlug="payments-uk">{page}</LiveUpdatesProvider>,
  );
}

beforeEach(() => {
  routerMock.replace.mockClear();
  navigationState.currentPathname = '/w/payments-uk/policies';
  vi.stubGlobal('WebSocket', OpeningWebSocketStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('PoliciesPage', () => {
  it('selects the first policy when the URL names none', async () => {
    stubApi(stubCollection('policies', policyFixtures));
    renderPage(<PoliciesPage />);

    await vi.waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith(
        '/w/payments-uk/policies?policy=policy-payments-restart',
        { scroll: false },
      ),
    );
  });

  it('shows a policy and the effective result, including an inherited deny', async () => {
    stubApi(stubCollection('policies', policyFixtures));
    renderPage(<PoliciesPage />, 'policy=policy-card-failover');

    const effective = (await screen.findByRole('heading', { name: 'Effective policy' })).closest(
      'section',
    ) as HTMLElement;
    expect(within(effective).getByText('Deny')).toBeInTheDocument();
    expect(within(effective).getByText('Emergency freeze')).toBeInTheDocument();
    expect(
      within(effective).getByText('0 allowed · 0 need approval · 6 denied'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Fail over card routing/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});

describe('RunbooksPage', () => {
  it('lists each step by kind and the latest run', async () => {
    stubApi(stubCollection('runbooks', runbookFixtures()));
    renderPage(<RunbooksPage />, 'runbook=runbook-payments-rollback');

    expect(await screen.findByText('Step 3 · Gate')).toBeInTheDocument();
    expect(screen.getByText('Roll back the deployment')).toBeInTheDocument();
    expect(screen.getByText('INC-1998')).toBeInTheDocument();
    expect(screen.getByText('v12, pinned')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Redis failover/ })).toHaveTextContent(
      'Manual · review due',
    );
  });
});

describe('IncidentTypesPage', () => {
  it('shows the type configuration and the responder preview', async () => {
    stubApi(stubCollection('settings/incident-types', incidentTypeFixtures));
    renderPage(<IncidentTypesPage />, 'type=type-production-outage');

    expect(
      await screen.findByText('Triage → Investigating → Mitigating → Monitoring → Resolved'),
    ).toBeInTheDocument();
    expect(screen.getByText('Customer region when SEV1')).toBeInTheDocument();
    expect(screen.getByText('DORA ICT v4')).toBeInTheDocument();
  });
});
