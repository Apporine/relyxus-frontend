import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AnalyticsPage, relativeChange } from '@/features/analytics/analytics-page';
import { AuditLogPage } from '@/features/audit/audit-log-page';
import { ComplianceCentrePage } from '@/features/compliance/compliance-centre-page';
import { IntegrationsPage } from '@/features/integrations/integrations-page';
import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';
import { reliabilityAnalyticsFor } from '@/mocks/fixtures/analytics-fixtures';
import { auditLogPageFor } from '@/mocks/fixtures/audit-fixtures';
import { commandCentreFixturesFor } from '@/mocks/fixtures/command-centre-fixtures';
import { complianceOverviewFor } from '@/mocks/fixtures/compliance-fixtures';
import { connectedSystemsFor, connectorCatalogueFor } from '@/mocks/fixtures/integration-fixtures';
import { navigationState } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';
import { OpeningWebSocketStub, stubApi } from '@/test/stub-api';

// The pages import next/navigation before the helper below loads, so the factory imports it.
vi.mock(
  'next/navigation',
  async () => (await import('@/test/next-navigation-mock')).nextNavigationMock,
);
// ECharts needs a canvas, which jsdom lacks; chart options are unit-tested separately.
vi.mock('@/lib/charts/echart', () => ({
  EChart: ({ label }: { label: string }) => <div role="img" aria-label={label} />,
}));

const WORKSPACE_SLUG = 'payments-uk';
const WORKSPACE_PATH = `/api/v1/workspaces/${WORKSPACE_SLUG}`;

function renderPage(page: React.ReactElement) {
  return renderInWorkspace(
    <LiveUpdatesProvider workspaceSlug={WORKSPACE_SLUG}>{page}</LiveUpdatesProvider>,
  );
}

beforeEach(() => {
  navigationState.currentSearchParams = new URLSearchParams();
  vi.stubGlobal('WebSocket', OpeningWebSocketStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('relativeChange', () => {
  it('compares against the prior period and refuses to divide by zero', () => {
    expect(relativeChange(31, 39)).toBeCloseTo(-0.205, 3);
    expect(relativeChange(0, 0)).toBe(0);
    expect(relativeChange(3, 0)).toBeNull();
  });
});

describe('AnalyticsPage', () => {
  it('shows the headline metrics, incidents by service and sourced drill-downs', async () => {
    stubApi([
      {
        pathname: `${WORKSPACE_PATH}/analytics/reliability`,
        respond: () => reliabilityAnalyticsFor(WORKSPACE_SLUG),
      },
    ]);
    renderPage(<AnalyticsPage />);

    expect(await screen.findByText('Down 8m')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Card payments' })).toHaveAttribute(
      'href',
      '/w/payments-uk/incidents?status=all&service=svc-card-payments',
    );
    const drillDowns = screen.getByRole('table', {
      name: 'Reliability metrics against the prior window',
    });
    const mttrRow = within(drillDowns).getByRole('row', { name: /^MTTR/ });
    expect(mttrRow).toHaveTextContent('-20.5%');
    expect(mttrRow).toHaveTextContent('Incident records');
  });
});

describe('AuditLogPage', () => {
  it('lists ledger events with hash and SIEM status, masking restricted details', async () => {
    stubApi([
      {
        pathname: `${WORKSPACE_PATH}/audit-events`,
        respond: () => auditLogPageFor(WORKSPACE_SLUG, null),
      },
    ]);
    renderPage(<AuditLogPage />);

    const table = await screen.findByRole('table', { name: 'Events' });
    expect(within(table).getByText('approval.granted')).toBeInTheDocument();
    expect(within(table).getAllByText('Restricted')).toHaveLength(3);
    expect(within(table).getByText('Queued')).toBeInTheDocument();
    expect(screen.getByText(/Hash chain verified up to/)).toBeInTheDocument();
  });
});

describe('IntegrationsPage', () => {
  it('shows each connected system with health, scope and access mode', async () => {
    stubApi([
      {
        pathname: `${WORKSPACE_PATH}/integrations/connected`,
        respond: () => ({ items: connectedSystemsFor(WORKSPACE_SLUG), nextCursor: null }),
      },
      {
        pathname: `${WORKSPACE_PATH}/integrations/catalogue`,
        respond: () => ({ items: connectorCatalogueFor(WORKSPACE_SLUG), nextCursor: null }),
      },
    ]);
    renderPage(<IntegrationsPage />);

    const serviceNow = await screen.findByRole('row', { name: /ServiceNow/ });
    expect(serviceNow).toHaveTextContent('Degraded');
    expect(serviceNow).toHaveTextContent('Write gated');
  });
});

describe('ComplianceCentrePage', () => {
  it('shows running clocks, incidents needing attention and evidence completeness', async () => {
    stubApi([
      {
        pathname: `${WORKSPACE_PATH}/regulator-clocks`,
        respond: () => ({
          items: commandCentreFixturesFor(WORKSPACE_SLUG)?.regulatorClocks ?? [],
          nextCursor: null,
        }),
      },
      {
        pathname: `${WORKSPACE_PATH}/compliance/overview`,
        respond: () => complianceOverviewFor(WORKSPACE_SLUG),
      },
    ]);
    renderPage(<ComplianceCentrePage />);

    expect(await screen.findByRole('region', { name: 'DORA initial notice' })).toBeInTheDocument();
    const attention = await screen.findByRole('table', {
      name: 'Incidents requiring compliance attention',
    });
    expect(within(attention).getByRole('row', { name: /INC-2038/ })).toHaveTextContent(
      'Unassigned',
    );
    expect(within(attention).queryByText('INC-1999')).not.toBeInTheDocument();
    expect(screen.getByText('87% · 2 sources missing')).toBeInTheDocument();
  });
});
