import { screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RegulatorReportPage } from '@/features/compliance/regulator-report-page';
import { RuleLibraryPage } from '@/features/compliance/rule-library-page';
import { ApprovalRoutingPage } from '@/features/policies/approval-routing-page';
import { NotificationRulesPage } from '@/features/policies/notification-rules-page';
import { PostIncidentReviewPage } from '@/features/post-incident-review/post-incident-review-page';
import { LiveUpdatesProvider } from '@/lib/live/live-updates-provider';
import {
  approvalRouteFixtures,
  notificationRuleFixtures,
  postIncidentReviewFixture,
  regulatorReportFixture,
  rulePackageFixtures,
} from '@/mocks/fixtures/governance-fixtures';
import { navigationState } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';
import { OpeningWebSocketStub, stubApi, type StubbedApiRoute } from '@/test/stub-api';

// The pages import next/navigation before the helper above loads, so the factory imports it.
vi.mock(
  'next/navigation',
  async () => (await import('@/test/next-navigation-mock')).nextNavigationMock,
);

const WORKSPACE_PATH = '/api/v1/workspaces/payments-uk';

function collectionRoutes<Detail extends { id: string }>(
  resource: string,
  details: Detail[],
): StubbedApiRoute[] {
  return [
    {
      pathname: `${WORKSPACE_PATH}/${resource}`,
      respond: () => ({ items: details, nextCursor: null }),
    },
    ...details.map((detail) => ({
      pathname: `${WORKSPACE_PATH}/${resource}/${detail.id}`,
      respond: () => detail,
    })),
  ];
}

function renderPage(page: React.ReactElement, searchParameters: string) {
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

describe('ApprovalRoutingPage', () => {
  it('previews the exact approvers and flags an ineligible one', async () => {
    stubApi(collectionRoutes('policies/approval-routes', approvalRouteFixtures));
    renderPage(<ApprovalRoutingPage />, 'route=route-security-changes');

    expect(await screen.findByText('Priya Nair · CISO')).toBeInTheDocument();
    const approvers = panelNamed('Exact approvers');
    expect(
      within(approvers).getByText('At least one approver is not eligible'),
    ).toBeInTheDocument();
    expect(within(approvers).getByText('Never approves automatically')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Policies views' })).toBeInTheDocument();
  });
});

describe('NotificationRulesPage', () => {
  it('previews who is contacted, when, and that restricted details never leak', async () => {
    stubApi(collectionRoutes('policies/notification-rules', notificationRuleFixtures));
    renderPage(<NotificationRulesPage />, 'rule=rule-sev1-customer-impact');

    expect(await screen.findByText('Teams and SMS after 15 minutes')).toBeInTheDocument();
    expect(screen.getByText('No restricted details are sent')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Connector degraded/ })).toHaveTextContent('Disabled');
  });
});

describe('RuleLibraryPage', () => {
  it('warns when a rule package is not signed off and has conflicts', async () => {
    stubApi(collectionRoutes('compliance/rule-packages', rulePackageFixtures));
    renderPage(<RuleLibraryPage />, 'package=package-sa-sama');

    expect(await screen.findByText('Not yet signed off; do not rely on it')).toBeInTheDocument();
    expect(
      screen.getByText('Notification window overlaps the CBUAE outsourcing rule'),
    ).toBeInTheDocument();
  });
});

describe('RegulatorReportPage', () => {
  const report = regulatorReportFixture();
  const reportRoute = {
    pathname: `${WORKSPACE_PATH}/regulator-reports/${report.id}`,
    respond: () => report,
  };

  it('shows the selected field with every source and its authorship', async () => {
    stubApi([reportRoute]);
    renderPage(<RegulatorReportPage reportId={report.id} />, 'field=field-business-impact');

    expect(
      await screen.findByText('GBP 184,000 at risk; 18,400 failed transactions'),
    ).toBeInTheDocument();
    expect(screen.getByText('Impact meter · formula v8')).toBeInTheDocument();
    expect(screen.getByText('Prometheus · failed_transactions_total')).toBeInTheDocument();
  });

  it('blocks review while a required field still needs input', async () => {
    stubApi([reportRoute]);
    renderPage(<RegulatorReportPage reportId={report.id} />, 'field=field-duration');

    expect(await screen.findByRole('button', { name: 'Request review' })).toBeDisabled();
    expect(
      screen.getByText('Complete 1 required field before requesting review.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Not filled. Relyxus never guesses a regulator field.'),
    ).toBeInTheDocument();
  });
});

describe('PostIncidentReviewPage', () => {
  it('cannot complete a SEV1 review until every required reviewer signs', async () => {
    const review = postIncidentReviewFixture();
    stubApi([
      {
        pathname: `${WORKSPACE_PATH}/incidents/${review.incidentReference}/review`,
        respond: () => review,
      },
    ]);
    renderPage(<PostIncidentReviewPage incidentReference={review.incidentReference} />, '');

    expect(await screen.findByRole('button', { name: 'Complete review' })).toBeDisabled();
    expect(screen.getByText('2 required reviewers have not signed yet.')).toBeInTheDocument();
    expect(screen.getByText('This section has not been written yet.')).toBeInTheDocument();
    expect(panelNamed('Required reviewers')).toHaveTextContent('A. Rahman · Service owner');
  });
});
