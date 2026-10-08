# Contributing to the Relyxus web console

This repository follows the Relyxus Git and GitHub engineering contract. The rules below are
not optional: they exist so that a bank architecture review, an auditor or an engineer six
months from now can understand why every change was made.

## Branches

Never commit directly to `master` or `dev`. Every coherent change gets its own short-lived
branch named `<type>/<human-readable-purpose>`.

| Type       | Use for                                                      |
| ---------- | ------------------------------------------------------------ |
| `feat`     | New user-visible capability                                  |
| `fix`      | Behaviour that does not match the specification              |
| `hotfix`   | Urgent production fix                                        |
| `security` | Changes to permissions, visibility, secrets or data exposure |
| `perf`     | Measured performance improvement                             |
| `refactor` | Structural change with no behaviour change                   |
| `test`     | Tests only                                                   |
| `docs`     | Documentation only                                           |
| `chore`    | Tooling, configuration and repository maintenance            |

Good: `feat/incident-war-room-evidence-panel`, `fix/approval-countdown-expiry`.
Bad: `stage-1`, `phase-2`, `final-fix`, `new-feature`, branch names containing tool or
developer names.

## Commits

Use Conventional Commit semantics with a scope that names the area changed:

```
feat(incidents): add evidence drilldown to ranked hypotheses
fix(approvals): disable approve control once the approval window expires
```

For non-trivial commits, add a body that explains the problem, the implementation, the
behavioural consequences and the tests that were run. One commit per coherent concern:
not one enormous commit, and not one commit per keystroke.

## Pull requests

Every change reaches `master` through a pull request reviewed and merged by a human.
Authors never merge their own pull request. The pull request template lists the sections
every non-trivial description must contain.

Before marking a pull request ready for review, run every applicable check locally:

```
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

A failing required check means the pull request is not ready. Never write "all tests pass"
unless they were executed.

## Frontend rules that reviewers enforce

- Colours, spacing, radii, type sizes and motion come from Relyxus Obsidian design tokens.
  No hard-coded product colours inside components.
- Every user-facing string lives in the `messages` catalogues (English and Arabic). Sentences
  are never assembled from fragments.
- Layout uses logical CSS properties (`inline-start`, `inline-end`) so Arabic right-to-left
  works without special cases. Technical content (IDs, commands, queries, URLs, hashes) stays
  left-to-right in JetBrains Mono.
- Every screen handles the documented states: loading, true empty, filtered empty, error,
  degraded connector, Relyxus degraded, stale data, permission denied, restricted, read only,
  conflict, expired approval, offline and reconnecting.
- Hiding a control is never the security boundary. The backend revalidates every sensitive
  operation; the interface only reflects server-side permissions.
- Mocks belong in tests, Storybook and Mock Service Worker fixtures. They never reach a
  production code path.
- Do not add a dependency that the locked technology stack already covers.
