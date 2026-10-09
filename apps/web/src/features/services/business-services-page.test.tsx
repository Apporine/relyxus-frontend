import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';
import {
  businessServiceDetailFor,
  businessServiceSummariesFor,
} from '@/mocks/fixtures/business-service-fixtures';
import { navigationState, nextNavigationMock, routerMock } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';
import { OpeningWebSocketStub, stubApi, type StubbedApiRoute } from '@/test/stub-api';

import { BusinessServicesPage } from './business-services-page';

vi.mock('next/navigation', () => nextNavigationMock);

const WORKSPACE_SLUG = 'payments-uk';
const BUSINESS_SERVICES_PATH = `/api/v1/workspaces/${WORKSPACE_SLUG}/business-services`;

function businessServiceRoutes(businessServiceId: string): StubbedApiRoute[] {
  const detail = businessServiceDetailFor(WORKSPACE_SLUG, businessServiceId);
  return [
    {
      pathname: BUSINESS_SERVICES_PATH,
      respond: () => ({ items: businessServiceSummariesFor(WORKSPACE_SLUG), nextCursor: null }),
    },
    {
      pathname: `${BUSINESS_SERVICES_PATH}/${businessServiceId}`,
      status: detail === null ? 404 : 200,
      respond: () => detail ?? { title: 'Business service not found', status: 404 },
    },
  ];
}

function openBusinessServices(searchParameters: string) {
  navigationState.currentSearchParams = new URLSearchParams(searchParameters);
  return renderInWorkspace(
    <LiveUpdatesProvider workspaceSlug={WORKSPACE_SLUG}>
      <BusinessServicesPage />
    </LiveUpdatesProvider>,
  );
}

async function findDetail(name: string) {
  return (await screen.findByRole('heading', { level: 2, name })).closest('section') as HTMLElement;
}

describe('BusinessServicesPage', () => {
  beforeEach(() => {
    routerMock.replace.mockClear();
    navigationState.currentPathname = `/w/${WORKSPACE_SLUG}/services/business`;
    vi.stubGlobal('WebSocket', OpeningWebSocketStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('selects the first business service when the URL names none', async () => {
    stubApi(businessServiceRoutes('svc-card-payments'));
    openBusinessServices('');

    await vi.waitFor(() =>
      expect(routerMock.replace).toHaveBeenCalledWith(
        '/w/payments-uk/services/business?service=svc-card-payments',
        { scroll: false },
      ),
    );
  });

  it('marks this view as current in the Services area navigation', async () => {
    stubApi(businessServiceRoutes('svc-card-payments'));
    openBusinessServices('service=svc-card-payments');

    const areaNavigation = await screen.findByRole('navigation', { name: 'Services views' });
    expect(within(areaNavigation).getByRole('link', { name: 'Business services' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      within(areaNavigation).getByRole('link', { name: 'Technical services' }),
    ).toHaveAttribute('href', '/w/payments-uk/services');
  });

  it('counts down to breach in the list only for disrupted services', async () => {
    stubApi(businessServiceRoutes('svc-card-payments'));
    openBusinessServices('service=svc-card-payments');

    const cardPayments = await screen.findByRole('link', { name: /^Card payments/ });
    expect(within(cardPayments).getByText('At risk')).toBeInTheDocument();
    expect(await within(cardPayments).findByText(/to breach$/)).toBeInTheDocument();

    const customerLogin = screen.getByRole('link', { name: /^Customer login/ });
    expect(within(customerLogin).queryByRole('timer')).not.toBeInTheDocument();
  });

  it('explains time to breach, its dependencies and where the impact figure comes from', async () => {
    stubApi(businessServiceRoutes('svc-card-payments'));
    openBusinessServices('service=svc-card-payments');

    const detail = await findDetail('Card payments');
    expect(
      within(detail).getByRole('region', { name: 'Time to breach for Card payments' }),
    ).toBeInTheDocument();
    expect(within(detail).getByText(/Formula v8 · Measured · Prometheus/)).toBeInTheDocument();
    expect(within(detail).getByText('Impact formula changed from v7 to v8')).toBeInTheDocument();
    expect(within(detail).getByRole('link', { name: 'payments-api' })).toHaveAttribute(
      'href',
      '/w/payments-uk/services?service=payments-api&tab=dependencies',
    );
    expect(within(detail).getByText('DORA and UK Operational Resilience')).toBeInTheDocument();
    expect(
      within(detail).getByText('41% of the budget remains for this calendar month'),
    ).toBeInTheDocument();
  });

  it('never links a breach to an incident the viewer may not open', async () => {
    stubApi(businessServiceRoutes('svc-card-payments'));
    openBusinessServices('service=svc-card-payments');

    const breachHistory = (await screen.findByRole('heading', { name: 'Breach history' })).closest(
      'section',
    ) as HTMLElement;
    expect(within(breachHistory).getByText(/outside tolerance/)).toBeInTheDocument();
    expect(within(breachHistory).queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the posture in words, including near breach', async () => {
    stubApi(businessServiceRoutes('svc-card-payments'));
    openBusinessServices('service=svc-card-payments');

    const posture = (await screen.findByRole('heading', { name: 'Current posture' })).closest(
      'section',
    ) as HTMLElement;
    expect(await within(posture).findByText(/consumed · Near breach$/)).toBeInTheDocument();
    expect(within(posture).getByText('Fresh')).toBeInTheDocument();
    expect(within(posture).getByText('None')).toBeInTheDocument();
  });

  it('marks a manual override and stale impact data', async () => {
    stubApi(businessServiceRoutes('svc-settlement'));
    openBusinessServices('service=svc-settlement');

    const detail = await findDetail('Settlement');
    expect(within(detail).getByText('Overridden')).toBeInTheDocument();
    expect(
      within(detail).getByText(/Set by Daniel Okafor at .*: Month-end volumes are twice/),
    ).toBeInTheDocument();
    expect(within(detail).getByText('Impact data is stale')).toBeInTheDocument();
    expect(within(detail).getByRole('link', { name: 'INC-2031' })).toHaveAttribute(
      'href',
      '/w/payments-uk/incidents/INC-2031',
    );
    expect(screen.getByText('Overridden by Daniel Okafor')).toBeInTheDocument();
  });

  it('names the fallback when the impact source is missing', async () => {
    stubApi(businessServiceRoutes('svc-customer-login'));
    openBusinessServices('service=svc-customer-login');

    const detail = await findDetail('Customer login');
    expect(within(detail).getByText('Impact source missing')).toBeInTheDocument();
    expect(
      within(detail).getByText(/uses the fallback assumption: Same weekday last month/),
    ).toBeInTheDocument();
    expect(within(detail).getByText('Not disrupted. Tolerance 30m.')).toBeInTheDocument();
    expect(screen.getByText('Missing')).toBeInTheDocument();
  });

  it('says when no technical services are mapped', async () => {
    stubApi(businessServiceRoutes('svc-merchant-onboarding'));
    openBusinessServices('service=svc-merchant-onboarding');

    expect(
      await screen.findByText('No technical services are mapped to this business service.'),
    ).toBeInTheDocument();
  });

  it('shows the shared no-access state for a business service that does not exist', async () => {
    stubApi(businessServiceRoutes('svc-missing'));
    openBusinessServices('service=svc-missing');

    expect(
      await screen.findByRole('heading', { name: "You don't have access to this item" }),
    ).toBeInTheDocument();
  });
});
