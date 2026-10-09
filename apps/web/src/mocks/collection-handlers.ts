import { http, HttpResponse } from 'msw';

/* DEVELOPMENT ONLY. List and detail handlers for a workspace collection (ADR 0004). */

const DEMO_WORKSPACE_SLUG = 'payments-uk';

type Identified = { id: string };

/** `GET .../{resource}` returns summaries; `GET .../{resource}/{id}` returns one detail. */
export function collectionHandlers<Detail extends Identified>(
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
