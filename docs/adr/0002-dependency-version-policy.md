# ADR 0002: Frontend dependency version policy

Status: proposed
Date: 2026-10-08

## Context

The Technology Stack Decision requires supported LTS lines, pinned patches and controlled
upgrades: "Latest must never be a production versioning strategy". On 8 October 2026
several locked libraries had very recent new major versions:

| Library             | Newest major (release date)       | Established line |
| ------------------- | --------------------------------- | ---------------- |
| TypeScript          | 7.0 native compiler (8 July 2026) | 5.9              |
| TanStack Table      | 9.0 (4 August 2026)               | 8.21             |
| Vitest              | 5.0 (3 September 2026)            | 4.1              |
| Mock Service Worker | 3.0 (28 September 2026)           | 2.15             |
| ESLint              | 10.0 (6 February 2026)            | 9.x              |
| Next.js             | 16.4.0 (6 October 2026)           | 16.3 patch line  |

## Decision

- Pin exact versions in `package.json` and commit `pnpm-lock.yaml`.
- Use Next.js 16.3 (Active LTS major, settled patch line) and the React 19 release it supports.
- Use TypeScript 5.9: `typescript-eslint` supports up to 6.0, and TypeScript 7 changes the
  compiler API that Next.js and lint tooling rely on.
- Use TanStack Table 8, Vitest 4, MSW 2 and ESLint 9 until each newer major has been
  evaluated on a dedicated `chore/` branch with the full test suite.

## Consequences

- Upgrades are deliberate pull requests with release notes reviewed, not side effects of an
  install.
- Dependabot or Renovate, once configured, should group minor and patch updates and open
  separate pull requests for majors.
