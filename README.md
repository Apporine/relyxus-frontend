# Relyxus web console

The Relyxus web console is the operator interface for Relyxus, the AI incident response and
operational resilience platform for regulated enterprises built by Apporine.

The console must run unchanged in every Relyxus deployment mode: Apporine SaaS, dedicated
single tenant, customer self-hosted Kubernetes and fully air-gapped networks. It therefore
never loads runtime assets from public CDNs; fonts and every other asset are bundled.

## Prerequisites

| Tool    | Version                                                                     |
| ------- | --------------------------------------------------------------------------- |
| Node.js | 22.12 or later on the 22 line (see `.nvmrc`); Vite 8 refuses older versions |
| pnpm    | 10.11, pinned in `package.json`; enable it with `corepack enable`           |

## Getting started

```bash
corepack enable          # once per machine, provides the pinned pnpm
pnpm install             # install every workspace package
pnpm dev                 # start the console at http://localhost:3000
```

`pnpm dev` opens the Payments / UK sample workspace. Until the Relyxus API is available, Mock
Service Worker answers API calls in the browser with clearly labelled development fixtures
(`apps/web/src/mocks`). To point the development server at a real API on the same origin
instead, start it with mocking disabled:

```bash
# macOS and Linux
NEXT_PUBLIC_RELYXUS_API_MOCKING=disabled pnpm dev

# Windows PowerShell
$env:NEXT_PUBLIC_RELYXUS_API_MOCKING = 'disabled'; pnpm dev
```

Use another port with `pnpm dev --port 3100`.

## Commands

Run these from the repository root.

| Command                                     | What it does                                              |
| ------------------------------------------- | --------------------------------------------------------- |
| `pnpm dev`                                  | Development server with mock API at http://localhost:3000 |
| `pnpm build`                                | Production build of every package                         |
| `pnpm --filter @relyxus/web start`          | Serve the production build at http://localhost:3000       |
| `pnpm test`                                 | Unit and component tests (Vitest, Testing Library, axe)   |
| `pnpm lint`                                 | ESLint across the workspace                               |
| `pnpm typecheck`                            | TypeScript strict type check                              |
| `pnpm format` / `pnpm format:check`         | Apply or verify Prettier formatting                       |
| `pnpm --filter @relyxus/ui storybook`       | Component workshop at http://localhost:6006               |
| `pnpm --filter @relyxus/ui build-storybook` | Static Storybook build                                    |

Production builds never include the mock API. Without a Relyxus API behind `/api`, the
production server shows the "session could not be loaded" state, which is expected.

The build uses Next.js `standalone` output for container images:
`apps/web/.next/standalone` contains the server, which needs `.next/static` and `public`
copied alongside it.

End-to-end tests start their own development server on port 3200. If `pnpm dev` is already
running, point them at it with `PLAYWRIGHT_BASE_URL=http://localhost:3000`. Where Playwright's
browser download is blocked, set `PLAYWRIGHT_BROWSER_CHANNEL=chrome` to use the installed
Chrome.

Before opening a pull request, run `pnpm format:check`, `pnpm lint`, `pnpm typecheck`,
`pnpm test` and `pnpm build`. CI runs the same checks on every pull request.

## Repository layout

```
apps/
  web/                 Next.js console
    src/app/           Routes only: layouts and pages
    src/features/      One folder per product area
    src/shell/         Top bar, sidebar, banners, command palette, workspace guard
    src/lib/           API client, live updates, formatting, localisation
    src/messages/      English and Arabic message catalogues
    src/mocks/         Development-only API fixtures (Mock Service Worker)
packages/
  ui/                  Relyxus design system: Obsidian tokens, base and Relyxus components
docs/
  frontend/            Implementation plan and open questions
  adr/                 Architecture decision records
```

## Language and direction

The console ships in English and Arabic. Switch language from the account menu (initials at
the top right); Arabic mirrors the whole layout while commands, IDs and queries stay
left-to-right.

## Source documents

Product behaviour, technology and design decisions are governed by these documents, in this
order of authority:

1. Relyxus Master Product Specification v2.0 (product logic, permissions, lifecycle)
2. Relyxus Enterprise Technology Stack and Architecture Decision (technology and repository)
3. Relyxus UI/UX Master Design Specification v2.0 (screens, interaction, accessibility)
4. Relyxus Obsidian design package (visual styling only)
5. Relyxus Git and GitHub engineering contract (branches, commits, pull requests)

The frontend implementation plan and the open questions log live in
[docs/frontend](docs/frontend); architecture decisions live in [docs/adr](docs/adr).

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a branch.
