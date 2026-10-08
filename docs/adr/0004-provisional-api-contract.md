# ADR 0004: Provisional API contract until OpenAPI is published

Status: proposed
Date: 2026-10-08

## Context

OpenAPI is the authoritative REST contract and frontend types should be generated from it.
The backend has not yet published an OpenAPI file. The UI/UX specification expects screens
to be built against generated clients and mocked with Mock Service Worker, and the
engineering contract forbids fabricating an external integration API.

## Decision

- Each feature declares the response shapes it consumes as Zod schemas in
  `features/<area>/model`, derived only from entities and fields named in Product
  Specification section 20 and the UI/UX screen specifications.
- The HTTP client follows the conventions the Product Specification already fixes
  (section 22A): versioned `/v1` paths, cursor pagination, RFC 9457 problem details with a
  correlation ID, idempotency keys on creating or acting requests, ETag and `If-Match` on
  updates, `429` with `Retry-After`.
- Endpoint paths used by the frontend are listed in each feature's `api` module so the
  backend team can review them in one place.
- When the OpenAPI file exists, generated types replace these schemas feature by feature;
  runtime Zod validation at the boundary stays.

## Consequences

- Screens can be built and tested now without guessing behaviour.
- Every provisional shape is a review item for the API owners, tracked as open question Q4.
- No mock or fixture is reachable from a production build: MSW starts only when the
  development flag is set.
