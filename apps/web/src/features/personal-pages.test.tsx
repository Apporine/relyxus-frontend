import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminOverviewPage } from '@/features/admin/admin-overview-page';
import { OnboardingPage } from '@/features/onboarding/onboarding-page';
import { PersonalSettingsPage } from '@/features/personal-settings/personal-settings-page';
import { WallModePage, wallVisibleIncidents } from '@/features/wall-mode/wall-mode-page';
import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';
import { commandCentreFixturesFor } from '@/mocks/fixtures/command-centre-fixtures';
import { incidentRecordsFor } from '@/mocks/fixtures/incident-fixtures';
import { onboardingProgressFixture } from '@/mocks/fixtures/onboarding-fixture';
import { navigationState } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';
import { OpeningWebSocketStub, stubApi } from '@/test/stub-api';

// The pages import next/navigation before the helper above loads, so the factory imports it.
vi.mock(
  'next/navigation',
  async () => (await import('@/test/next-navigation-mock')).nextNavigationMock,
);
vi.mock('@/shell/preferences/set-preferred-locale', () => ({
  setPreferredLocale: vi.fn(async () => undefined),
}));

const WORKSPACE_PATH = '/api/v1/workspaces/payments-uk';

function renderPage(page: React.ReactElement, searchParameters = '') {
  navigationState.currentSearchParams = new URLSearchParams(searchParameters);
  return renderInWorkspace(
    <LiveUpdatesProvider workspaceSlug="payments-uk">{page}</LiveUpdatesProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal('WebSocket', OpeningWebSocketStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AdminOverviewPage', () => {
  it('separates workspace settings from organisation settings', () => {
    stubApi([]);
    renderPage(<AdminOverviewPage />);

    const workspaceGroup = screen
      .getByRole('heading', { name: 'This workspace' })
      .closest('section') as HTMLElement;
    expect(within(workspaceGroup).getByRole('link', { name: /Incident types/ })).toHaveAttribute(
      'href',
      '/w/payments-uk/settings/incident-types',
    );
    const organisationGroup = screen
      .getByRole('heading', { name: 'Organisation' })
      .closest('section') as HTMLElement;
    expect(within(organisationGroup).getAllByRole('link')).toHaveLength(6);
  });
});

describe('PersonalSettingsPage', () => {
  it('offers the interface language as a real choice', () => {
    stubApi([]);
    renderPage(<PersonalSettingsPage />, 'section=language');

    const languages = screen.getByRole('radiogroup', { name: 'Interface language' });
    expect(within(languages).getByRole('radio', { name: 'English' })).toBeChecked();
    expect(within(languages).getByRole('radio', { name: 'العربية' })).not.toBeChecked();
  });
});

describe('OnboardingPage', () => {
  it('shows the current step and the sample workspace', async () => {
    stubApi([{ pathname: '/api/v1/onboarding', respond: () => onboardingProgressFixture }]);
    renderPage(<OnboardingPage />);

    const current = await screen.findByText('2. Connect first source');
    expect(current.closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('link', { name: 'Explore the sample workspace' })).toHaveAttribute(
      'href',
      '/w/payments-uk/home',
    );
  });
});

describe('WallModePage', () => {
  it('never shows a restricted incident', () => {
    const incidents = incidentRecordsFor('payments-uk') ?? [];
    const restricted = {
      ...incidents[0]!,
      reference: 'INC-1999',
      visibility: 'restricted-group' as const,
    };

    expect(
      wallVisibleIncidents([...incidents, restricted]).map((incident) => incident.reference),
    ).not.toContain('INC-1999');
  });

  it('shows active incidents, services at risk and connector health', async () => {
    const fixtures = commandCentreFixturesFor('payments-uk');
    const list = <Item,>(items: Item[]) => ({ items, nextCursor: null });
    stubApi([
      {
        pathname: `${WORKSPACE_PATH}/incidents`,
        respond: () => list(fixtures?.activeIncidents ?? []),
      },
      {
        pathname: `${WORKSPACE_PATH}/business-services`,
        respond: () => list(fixtures?.businessServicesAtRisk ?? []),
      },
      { pathname: `${WORKSPACE_PATH}/connectors`, respond: () => list(fixtures?.connectors ?? []) },
      {
        pathname: `${WORKSPACE_PATH}/regulator-clocks`,
        respond: () => list(fixtures?.regulatorClocks ?? []),
      },
    ]);
    renderPage(<WallModePage />);

    expect(await screen.findByText('Card authorisation failures in UK')).toBeInTheDocument();
    const connectors = fixtures?.connectors ?? [];
    const healthyCount = connectors.filter((connector) => connector.health === 'connected').length;
    expect(
      await screen.findByText(`${healthyCount} of ${connectors.length} connectors healthy`),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Restricted incidents are never shown on wall mode.'),
    ).toBeInTheDocument();
  });
});
