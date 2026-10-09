import { http, HttpResponse } from 'msw';

import { collectionHandlers } from './collection-handlers';
import {
  approvalRouteFixtures,
  notificationRuleFixtures,
  postIncidentReviewFixture,
  regulatorReportFixture,
  rulePackageFixtures,
} from './fixtures/governance-fixtures';

/*
 * DEVELOPMENT ONLY. Approval routing, notification rules, rule packages, regulator reports
 * and post-incident reviews. Registered before the policies collection so
 * /policies/approval-routes is not read as a policy id.
 */

const workspacePath = '/api/v1/workspaces/:workspaceSlug';

function notFound() {
  return HttpResponse.json(
    { title: 'Not found', status: 404, correlationId: 'RX-MOCK-404' },
    { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

export const governanceHandlers = [
  ...collectionHandlers(
    'policies/approval-routes',
    () => approvalRouteFixtures,
    ({ id, name, mode, stageCount, quorum }) => ({ id, name, mode, stageCount, quorum }),
  ),
  ...collectionHandlers(
    'policies/notification-rules',
    () => notificationRuleFixtures,
    ({ id, name, isEnabled, channels }) => ({ id, name, isEnabled, channels }),
  ),
  ...collectionHandlers(
    'compliance/rule-packages',
    () => rulePackageFixtures,
    ({ id, jurisdiction, name }) => ({ id, jurisdiction, name }),
  ),

  http.get(`${workspacePath}/regulator-reports/:reportId`, ({ params }) => {
    const report = regulatorReportFixture();
    return params.workspaceSlug === 'payments-uk' && params.reportId === report.id
      ? HttpResponse.json(report)
      : notFound();
  }),

  http.get(`${workspacePath}/incidents/:incidentReference/review`, ({ params }) => {
    const review = postIncidentReviewFixture();
    return params.workspaceSlug === 'payments-uk' &&
      params.incidentReference === review.incidentReference
      ? HttpResponse.json(review)
      : notFound();
  }),
];
