import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';
import {
  forgetRecordedServiceConfirmations,
  recordServiceConfirmation,
  serviceDependenciesFor,
  serviceDetailFor,
  serviceSummariesFor,
} from '@/mocks/fixtures/service-fixtures';
import { navigationState, nextNavigationMock, routerMock } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';
import { OpeningWebSocketStub, stubApi, type StubbedApiRoute } from '@/test/stub-api';

import { ServicesPage } from './services-page';

vi.mock('next/navigation', () => nextNavigationMock);

const WORKSPACE_SLUG = 'payments-uk';
const SERVICES_PATH = `/api/v1/workspaces/${WORKSPACE_SLUG}/services`;
const notFound = { title: 'Service not found', status: 404 };

function serviceRoutes(serviceId: string): StubbedApiRoute[] {
  const detail = serviceDetailFor(WORKSPACE_SLUG, serviceId);
  return [
    {
      pathname: SERVICES_PATH,
      respond: () => ({ items: serviceSummariesFor(WORKSPACE_SLUG, ''), nextCursor: null }),
    },
    {
      pathname: `${SERVICES_PATH}/${serviceId}`,
      status: detail === null ? 404 : 200,
      respond: () => serviceDetailFor(WORKSPACE_SLUG, serviceId) ?? notFound,
    },
    {
      pathname: `${SERVICES_PATH}/${serviceId}/dependencies`,
      status: detail === null ? 404 : 200,
      respond: () => serviceDependenciesFor(WORKSPACE_SLUG, serviceId) ?? notFound,
    },
    {
      method: 'POST',
      pathname: `${SERVICES_PATH}/${serviceId}/confirmation`,
      respond: () => {
        recordServiceConfirmation(WORKSPACE_SLUG, serviceId);
        return { serviceId, discovery: 'confirmed' };
      },
    },
  ];
}

function openServices(searchParameters: string) {
  navigationState.currentSearchParams = new URLSearchParams(searchParameters);
  return renderInWorkspace(
    <LiveUpdatesProvider workspaceSlug={WORKSPACE_SLUG}>
      <ServicesPage />
    </LiveUpdatesProvider>,
  );
}

describe('ServicesPage', () => {
  beforeEach(() => {
    forgetRecordedServiceConfirmations();
    routerMock.replace.mockClear();
    navigationState.currentPathname = `/w/${WORKSPACE_SLUG}/services`;
    vi.stubGlobal('WebSocket', OpeningWebSocketStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('selects the first service when the URL names none', async () => {
    stubApi(serviceRoutes('payments-api'));
    openServices('');

    await vi.waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith(
        '/w/payments-uk/services?service=payments-api',
        { scroll: false },
      ),
    );
  });

  it('lists services with health, tier, owner and what needs attention', async () => {
    stubApi(serviceRoutes('payments-api'));
    openServices('service=payments-api');

    const ledgerSync = await screen.findByRole('link', { name: /ledger-sync/ });
    expect(within(ledgerSync).getByText('Tier 2 · No owner')).toBeInTheDocument();
    expect(within(ledgerSync).getByText('Unconfirmed')).toBeInTheDocument();
    expect(within(ledgerSync).getByText('No owner')).toBeInTheDocument();

    const legacyExport = screen.getByRole('link', { name: /legacy-batch-export/ });
    expect(within(legacyExport).getByText('Stale')).toBeInTheDocument();
    expect(within(legacyExport).getByText('Retired')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /payments-api/ })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  it('shows the selected service and warns about a vendor outage it depends on', async () => {
    stubApi(serviceRoutes('payments-api'));
    openServices('service=payments-api');

    expect(
      await screen.findByRole('heading', { level: 2, name: 'payments-api' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Vendor outage: Northwind Acquiring')).toBeInTheDocument();
    expect(
      screen.getByText(
        'payments-api depends on Northwind Acquiring, which is reporting an outage.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Card payments UK')).toBeInTheDocument();
  });

  it('lists the same dependencies as text in the Dependencies tab', async () => {
    stubApi(serviceRoutes('payments-api'));
    openServices('service=payments-api&tab=dependencies');

    const dependsOn = (await screen.findByRole('heading', { name: 'Depends on' })).closest(
      'section',
    ) as HTMLElement;
    expect(within(dependsOn).getByRole('link', { name: 'card-router' })).toHaveAttribute(
      'href',
      '/w/payments-uk/services?service=card-router&tab=dependencies',
    );
    expect(within(dependsOn).getByText('Northwind Acquiring')).toBeInTheDocument();
    expect(within(dependsOn).getByText('Vendor · Provided by')).toBeInTheDocument();

    const dependedOnBy = screen
      .getByRole('heading', { name: 'Depended on by' })
      .closest('section') as HTMLElement;
    expect(within(dependedOnBy).getByRole('link', { name: 'checkout-web' })).toBeInTheDocument();
  });

  it('never lists an incident the viewer may not open', async () => {
    stubApi(serviceRoutes('payments-api'));
    openServices('service=payments-api&tab=incidents');

    expect(
      await screen.findByRole('link', { name: 'Card authorisation failures in UK' }),
    ).toHaveAttribute('href', '/w/payments-uk/incidents/INC-2041');
    expect(screen.queryByText('INC-1999')).not.toBeInTheDocument();
  });

  it('explains which source applied when sources disagree', async () => {
    stubApi(serviceRoutes('notification-gateway'));
    openServices('service=notification-gateway');

    expect(
      await screen.findByText(/Relyxus applies the highest-priority source/),
    ).toBeInTheDocument();
    expect(screen.getByText('Customer communications')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('says where work goes for a service without an owner', async () => {
    stubApi(serviceRoutes('ledger-sync'));
    openServices('service=ledger-sync&tab=owners');

    expect(
      await screen.findByText(
        'This service has no owner. Its work routes to Platform engineering until an owner is assigned.',
      ),
    ).toBeInTheDocument();
  });

  it('confirms a discovered service once, with an idempotency key', async () => {
    const fetchMock = stubApi(serviceRoutes('ledger-sync'));
    openServices('service=ledger-sync');

    expect(
      await screen.findByText('Discovered service waiting for confirmation'),
    ).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: 'Confirm service' });
    await vi.waitFor(() => expect(confirmButton).toBeEnabled());
    await userEvent.click(confirmButton);

    expect(await screen.findByText('ledger-sync confirmed in the catalogue')).toBeInTheDocument();
    await vi.waitFor(() =>
      expect(screen.queryByText('Discovered service waiting for confirmation')).toBeNull(),
    );
    const confirmationCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');
    expect(confirmationCalls).toHaveLength(1);
    expect(new Headers(confirmationCalls[0]?.[1]?.headers).get('Idempotency-Key')).toMatch(
      /^[0-9a-f-]{36}$/,
    );
  });

  it('searches the catalogue after a pause in typing', async () => {
    stubApi(serviceRoutes('payments-api'));
    openServices('service=payments-api');

    await userEvent.type(await screen.findByRole('searchbox', { name: 'Search services' }), 'auth');

    await vi.waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith(
        '/w/payments-uk/services?q=auth&service=payments-api',
        { scroll: false },
      ),
    );
    expect(routerMock.replace).toHaveBeenCalledTimes(1);
  });

  it('shows the shared no-access state for a service that does not exist', async () => {
    stubApi(serviceRoutes('missing-service'));
    openServices('service=missing-service');

    expect(
      await screen.findByRole('heading', { name: "You don't have access to this item" }),
    ).toBeInTheDocument();
  });
});
