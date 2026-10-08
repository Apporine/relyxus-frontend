import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';
import { sessionFixture } from '@/mocks/fixtures/session-fixture';
import {
  forgetRecordedAcknowledgements,
  recordAcknowledgement,
  RESTRICTED_DEMO_INCIDENT_REFERENCE,
  warRoomFixtureFor,
  type WarRoomFixture,
} from '@/mocks/fixtures/war-room-fixtures';
import { navigationState, nextNavigationMock, routerMock } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';
import { OpeningWebSocketStub, stubApi, type StubbedApiRoute } from '@/test/stub-api';

import { WarRoomPage } from './war-room-page';

vi.mock('next/navigation', () => nextNavigationMock);

const WORKSPACE_SLUG = 'payments-uk';
const incidentPath = (reference: string) =>
  `/api/v1/workspaces/${WORKSPACE_SLUG}/incidents/${reference}`;

function fixtureFor(reference: string): WarRoomFixture {
  const fixture = warRoomFixtureFor(WORKSPACE_SLUG, reference);
  if (fixture === null) {
    throw new Error(`No war room fixture for ${reference}`);
  }
  return fixture;
}

function warRoomRoutes(reference: string): StubbedApiRoute[] {
  const path = incidentPath(reference);
  const list = <Item,>(items: Item[]) => ({ items, nextCursor: null });
  return [
    { pathname: path, respond: () => fixtureFor(reference).incident },
    { pathname: `${path}/investigation`, respond: () => fixtureFor(reference).investigation },
    { pathname: `${path}/actions`, respond: () => list(fixtureFor(reference).actions) },
    { pathname: `${path}/clocks`, respond: () => list(fixtureFor(reference).clocks) },
    { pathname: `${path}/communications`, respond: () => fixtureFor(reference).communications },
    { pathname: `${path}/timeline`, respond: () => list(fixtureFor(reference).timeline) },
    { pathname: `${path}/tasks`, respond: () => list(fixtureFor(reference).tasks) },
    {
      method: 'POST',
      pathname: `${path}/acknowledgements`,
      respond: () => recordAcknowledgement(reference, sessionFixture.user.displayName),
    },
  ];
}

function renderWarRoom(reference: string) {
  return renderInWorkspace(
    <LiveUpdatesProvider workspaceSlug={WORKSPACE_SLUG}>
      <WarRoomPage incidentReference={reference} />
    </LiveUpdatesProvider>,
  );
}

describe('WarRoomPage', () => {
  beforeEach(() => {
    forgetRecordedAcknowledgements();
    navigationState.currentPathname = `/w/${WORKSPACE_SLUG}/incidents/INC-2041`;
    navigationState.currentSearchParams = new URLSearchParams();
    vi.stubGlobal('WebSocket', OpeningWebSocketStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows impact, ownership and the nearest clock in the header', async () => {
    stubApi(warRoomRoutes('INC-2041'));
    renderWarRoom('INC-2041');

    const header = (
      await screen.findByRole('heading', { level: 1, name: 'Card authorisation failures in UK' })
    ).closest('header');
    expect(header).not.toBeNull();
    const headerScope = within(header as HTMLElement);
    expect(headerScope.getByText('SEV1')).toBeInTheDocument();
    expect(headerScope.getByText(/GBP\s184,000/)).toBeInTheDocument();
    expect(headerScope.getByText('Commander Sara Malik')).toBeInTheDocument();
    expect(
      await headerScope.findByRole('region', { name: 'DORA initial notice' }),
    ).toBeInTheDocument();
  });

  it('presents the AI assessment, ranked hypotheses and what was checked', async () => {
    stubApi(warRoomRoutes('INC-2041'));
    renderWarRoom('INC-2041');

    expect(
      await screen.findByText(/Payment failures correlate with a configuration rollout/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'AI generated' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Configuration regression in payments-api' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Pool usage, database latency, lock wait and failover state.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Card network status and synthetic checks were healthy throughout.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Open evidence' })[0]).toHaveAttribute(
      'href',
      '/w/payments-uk/incidents/INC-2041/evidence?hypothesis=hypothesis-config-regression',
    );
  });

  it('keeps a pending decision visible above the panel tabs and links to its approval', async () => {
    stubApi(warRoomRoutes('INC-2041'));
    renderWarRoom('INC-2041');

    expect(await screen.findByText('1 decision is waiting')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'View decisions' }));

    expect(routerMock.replace).toHaveBeenCalledWith(
      '/w/payments-uk/incidents/INC-2041?panel=decisions',
      {
        scroll: false,
      },
    );
  });

  it('acknowledges once, with an idempotency key, and records who acknowledged', async () => {
    const fetchMock = stubApi(warRoomRoutes('INC-2041'));
    renderWarRoom('INC-2041');

    const acknowledgeButton = await screen.findByRole('button', { name: 'Acknowledge' });
    await vi.waitFor(() => expect(acknowledgeButton).toBeEnabled());
    await userEvent.click(acknowledgeButton);

    expect(await screen.findByText(/Acknowledged by Sara Malik at/)).toBeInTheDocument();
    const acknowledgementCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(new Headers(acknowledgementCall?.[1]?.headers).get('Idempotency-Key')).toMatch(
      /^[0-9a-f-]{36}$/,
    );
  });

  it('acknowledges with the A shortcut', async () => {
    stubApi(warRoomRoutes('INC-2041'));
    renderWarRoom('INC-2041');

    const acknowledgeButton = await screen.findByRole('button', { name: 'Acknowledge' });
    await vi.waitFor(() => expect(acknowledgeButton).toBeEnabled());
    await userEvent.keyboard('a');

    expect(await screen.findByText(/Acknowledged by Sara Malik at/)).toBeInTheDocument();
  });

  it.each([
    ['a restricted incident', RESTRICTED_DEMO_INCIDENT_REFERENCE, 403],
    ['an incident that does not exist', 'INC-0000', 404],
  ])(
    'shows the same no-access state for %s and loads nothing else',
    async (_, reference, status) => {
      const fetchMock = stubApi([
        {
          pathname: incidentPath(reference),
          status,
          respond: () => ({ title: 'Not available', status }),
        },
      ]);
      renderWarRoom(reference);

      expect(
        await screen.findByRole('heading', { name: "You don't have access to this item" }),
      ).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );
});
