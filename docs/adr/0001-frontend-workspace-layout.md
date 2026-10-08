# ADR 0001: Frontend workspace layout

Status: proposed
Date: 2026-10-08

## Context

The Technology Stack Decision places the console in `apps/web`, a customer-facing assurance
site in `apps/trust-centre`, and the design system in `packages/ui` of one private
monorepo. The UI/UX specification, written for a single app, places base components in
`components/ui`, Relyxus components in `components/rx` and shell components in
`components/shell` inside `apps/web`. This repository currently holds only the frontend.

## Decision

- Use a pnpm workspace with `apps/web` and `packages/ui`. `apps/trust-centre` is added when
  the Trust Centre capability starts, not before.
- `packages/ui` is the Relyxus design system: Obsidian tokens, base components
  (`primitives/`, the UI/UX "ui" folder) and Relyxus components (`relyxus/`, the UI/UX "rx"
  folder). Both apps consume it, which is the reason it is a package rather than a folder.
- Shell components live in `apps/web/src/shell` because they depend on routing, session and
  live-connection state that the design system must not know about.
- Product areas live in `apps/web/src/features/<area>`; routes in `apps/web/src/app` stay thin.

## Consequences

- Moving into the Relyxus monorepo is a directory copy, not a restructure.
- Next.js transpiles `@relyxus/ui` from source (`transpilePackages`), so there is no
  separate package build step to keep in sync.
- Storybook lives with the design system in `packages/ui`.
