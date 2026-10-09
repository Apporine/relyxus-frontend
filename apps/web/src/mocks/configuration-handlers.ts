import { http, HttpResponse } from 'msw';

import {
  incidentTypeFixtures,
  policyFixtures,
  runbookFixtures,
} from './fixtures/configuration-fixtures';

/* DEVELOPMENT ONLY. Mock Service Worker handlers for policies, runbooks and incident types. */

const DEMO_WORKSPACE_SLUG = 'payments-uk';

type Identified = { id: string };

function collectionHandlers<Detail extends Identified>(
  resourcePath: string,
  details: () => Detail[],
  toSummary: (detail: Detail) => unknown,
) {
  const collectionPath = `/api/v1/workspaces/:workspaceSlug/${resourcePath}`;
  return [
    http.get(collectionPath, ({ params }) =>
      HttpResponse.json({
        items: params.workspaceSlug === DEMO_WORKSPACE_SLUG ? details().map(toSummary) : [],
        nextCursor: null,
      }),
    ),
    http.get(`${collectionPath}/:id`, ({ params }) => {
      const detail =
        params.workspaceSlug === DEMO_WORKSPACE_SLUG
          ? details().find((candidate) => candidate.id === params.id)
          : undefined;
      return detail === undefined
        ? HttpResponse.json(
            { title: 'Not found', status: 404, correlationId: 'RX-MOCK-404' },
            { status: 404, headers: { 'Content-Type': 'application/problem+json' } },
          )
        : HttpResponse.json(detail);
    }),
  ];
}

export const configurationHandlers = [
  ...collectionHandlers(
    'policies',
    () => policyFixtures,
    ({ id, name, autonomy, state }) => ({ id, name, autonomy, state }),
  ),
  ...collectionHandlers(
    'runbooks',
    runbookFixtures,
    ({ id, name, source, version, lastTestedAt, isReviewDue }) => ({
      id,
      name,
      source,
      version,
      lastTestedAt,
      isReviewDue,
    }),
  ),
  ...collectionHandlers(
    'settings/incident-types',
    () => incidentTypeFixtures,
    ({ id, name, version, state }) => ({ id, name, version, state }),
  ),
];
