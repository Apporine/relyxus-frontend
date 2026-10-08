# Relyxus web console: frontend implementation plan

Status: proposed for review
Scope: frontend only (`apps/web`, `packages/ui`, later `apps/trust-centre`)

This plan turns the Relyxus specifications into buildable capabilities. Each capability has a
human-readable name, the specification sections it implements, the Figma frames it follows,
its dependencies and the branch it will be delivered on. Capabilities are delivered as
separate pull requests in the order below; foundations come before screens, as required by
section 57 of the engineering contract.

## 1. Product understanding in one paragraph

Relyxus detects operational incidents, investigates them with evidence, ranks likely causes,
recommends actions, runs actions only inside customer-defined policy and approval rules,
drafts regulator reports while legal clocks run, and keeps a tamper-evident audit history.
The console is used at 3 a.m. by tired responders, by incident commanders, approvers,
compliance officers, security administrators and auditors. Its job is "calm control under
pressure": every screen answers "what needs me now, and is it safe?" first.

Rules that shape every frontend decision:

- Evidence before confidence. Every AI sentence links to evidence; AI-authored content always
  carries the AI marker.
- Production is never subtle. Environment and target are named in words on every
  production-impacting control. No single key press approves or runs a production action.
- Never move what someone is reading. Live updates collect behind an "N new updates" pill.
- Restricted incidents leak nothing: no title, count or ID in lists, search, notifications,
  analytics or URLs for people without access.
- The interface reflects server-side permissions; it is never the security boundary.
- Air-gapped operation: no runtime CDN, fonts bundled, no hidden data egress.

## 2. Documentation authority map

| Level | Document                                               | Governs in the frontend                                                                                               |
| ----- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 1     | Master Product Specification v2.0                      | Lifecycle states, severities, visibility, roles, approval rules, clocks, terminology                                  |
| 2     | Enterprise Technology Stack and Architecture Decision  | Framework versions, libraries, repository layout, testing tools                                                       |
| 3     | UI/UX Master Design Specification v2.0                 | Information architecture, routes, shell, components, interaction patterns, states, accessibility, RTL, copy           |
| 4     | Relyxus Obsidian design package (tokens, Figma frames) | Colours, typography family and scale, visual composition. Overrides blue/violet styling and the Inter font in level 3 |
| 5     | Git and GitHub engineering contract                    | Branches, commits, pull requests                                                                                      |

Where documents conflict the conflict is recorded in [open-questions.md](open-questions.md)
instead of being silently resolved.

## 3. Locked frontend stack

| Concern                  | Technology                                                                            | Pinned line |
| ------------------------ | ------------------------------------------------------------------------------------- | ----------- |
| Framework                | Next.js App Router, self-hosted Node runtime                                          | 16.3        |
| UI runtime               | React                                                                                 | 19          |
| Language                 | TypeScript, strict mode                                                               | 5.9         |
| Styling                  | Tailwind CSS mapped to `--rx-*` tokens, class-variance-authority variants             | 4.3         |
| Primitives               | Radix UI in the shadcn ownership pattern (source lives in `packages/ui`)              | 1.x         |
| Icons                    | Lucide, 1.5 px stroke, 16 and 20 px                                                   | 1.x         |
| Server state             | TanStack Query                                                                        | 5           |
| Tables                   | TanStack Table + TanStack Virtual                                                     | 8 / 3       |
| Forms                    | React Hook Form + Zod                                                                 | 7 / 4       |
| Charts                   | Apache ECharts                                                                        | 6           |
| Graphs                   | React Flow (`@xyflow/react`)                                                          | 12          |
| Localisation             | next-intl with ICU messages, English and Arabic                                       | 4           |
| Live updates             | WebSocket primary, Server-Sent Events fallback                                        | native      |
| Component workshop       | Storybook (React + Vite)                                                              | 10          |
| Mocking                  | Mock Service Worker                                                                   | 2           |
| Unit and component tests | Vitest + Testing Library + axe-core                                                   | 4           |
| End-to-end               | Playwright + `@axe-core/playwright`                                                   | 1.x         |
| Fonts                    | IBM Plex Sans Variable, IBM Plex Sans Arabic, JetBrains Mono (bundled via Fontsource) | 5           |

Why some lines are older than "latest" is recorded in
[ADR 0002](../adr/0002-dependency-version-policy.md).

## 4. Architecture

### 4.1 Workspace layout

```
relyxus-frontend/
  apps/
    web/                     Next.js console
      src/
        app/                 Routes only: layouts, pages, loading and error boundaries
          (shell)/w/[workspace]/...   one folder per route in UI/UX section 3
          (shell)/org/admin/...
          (shell)/me/settings/
          (auth)/sign-in/
        features/            One folder per product area; owns its queries, components, schemas
          command-centre/ incidents/ war-room/ approvals/ on-call/ services/ ai-quality/
          analytics/ policies/ runbooks/ compliance/ audit/ integrations/ admin/ settings/
        shell/               Top bar, sidebar, banners, context drawer, command palette, toasts
        lib/
          domain/            Zod schemas for the product vocabulary exported by @relyxus/ui
          api/               HTTP client, RFC 9457 problem details, idempotency and ETag handling
          live/              WebSocket client, SSE fallback, update buffering
          format/            Dates, durations, money, counts (locale aware, UTC toggle)
          i18n/              next-intl request configuration, locale and direction helpers
          permissions/       Typed capability checks that mirror server decisions
        messages/            en.json, ar.json
        mocks/               MSW handlers and clearly labelled development fixtures
      tests/e2e/             Playwright flows from UI/UX section 18
  packages/
    ui/                      Relyxus design system
      src/
        styles/              Obsidian tokens, base styles, typography, density, motion
        primitives/          Base components (UI/UX section 7, first table)
        relyxus/             Relyxus components (UI/UX section 7, second table)
        lib/                 Class name and accessibility helpers
      .storybook/
  docs/
    frontend/                This plan and the open questions log
    adr/                     Architecture decision records
```

The layout mirrors `apps/` and `packages/` from the Technology Stack Decision so this
repository can move into the Relyxus monorepo without restructuring
([ADR 0001](../adr/0001-frontend-workspace-layout.md)).

### 4.2 Dependency direction

```
app/ routes  ->  features/*  ->  shell/, lib/*  ->  @relyxus/ui
```

- Routes stay thin: read params, check access, render a feature screen.
- A feature never imports another feature's internals. The product vocabulary (severity,
  incident state, visibility, environment, action state) is defined once in `@relyxus/ui`
  because its components render it; `lib/domain` builds the API schemas from those values.
- `@relyxus/ui` knows nothing about the API, routing or the product data model beyond the
  presentational props it is given.

### 4.3 Data flow

- Server state lives in TanStack Query only. No second global state library.
- Local UI state stays in components; URL-addressable state (filters, tabs, drawer contents)
  lives in search parameters so links are shareable, as the UI/UX specification requires.
- Every response is parsed with a Zod schema at the boundary, so a contract change fails
  loudly at the edge rather than deep inside a component.
- Writes send an idempotency key; updates send `If-Match` with the last ETag. A `412` opens
  the conflict dialog ("Changed by Sara 20 seconds ago") rather than overwriting.
- Live events arrive over WebSocket (SSE fallback), update the Query cache, and are held in
  an update buffer while the person is reading. State-changing controls are disabled while
  the connection is reconnecting.

### 4.4 Security posture in the browser

- Authorisation decisions come from the API. The UI hides or disables controls to match
  them and explains "Why is this blocked?", but never treats hiding as enforcement.
- Restricted incidents: the client never receives them for unauthorised users; the UI must
  also avoid leaking through page titles, document metadata, analytics events or URLs.
- No secrets in client bundles, logs or fixtures; environment variables exposed to the
  browser are limited to non-sensitive configuration.
- Strict Content Security Policy with no third-party origins, suitable for air-gapped use.

## 5. Capability roadmap

Each capability is one pull request unless noted. Branch names follow the engineering
contract. Figma frame numbers refer to `New folder/screens`.

### Foundations

| #   | Capability                     | Specification                          | Delivers                                                                                                                                                                                                                       | Branch                                   |
| --- | ------------------------------ | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| 1   | Repository Governance          | Git contract                           | Ignore rules, line endings, contribution rules, PR template                                                                                                                                                                    | `chore/repository-governance-foundation` |
| 2   | Frontend Implementation Plan   | Contract s. 53, 56                     | This plan, ADRs, open questions                                                                                                                                                                                                | `docs/frontend-implementation-plan`      |
| 3   | Workspace Toolchain            | Tech stack s. 5, 13                    | pnpm workspace, Next.js app, strict TypeScript, ESLint, Prettier, Vitest, Playwright, CI workflow                                                                                                                              | `chore/web-workspace-toolchain`          |
| 4   | Obsidian Design Tokens         | UI/UX s. 5, Obsidian package, frame 00 | `--rx-*` tokens, Tailwind theme, bundled fonts, density, motion, layers, reduced motion                                                                                                                                        | `feat/obsidian-design-tokens`            |
| 5   | Base Component Library         | UI/UX s. 7 table 1, frame 01           | Button, icon button, text field, select, checkbox, switch, tabs, dialog, drawer, tooltip, toast, banner, skeleton, empty state, keyboard hint, copy, code viewer, plus Storybook                                               | `feat/base-component-library`            |
| 6   | Relyxus Domain Components      | UI/UX s. 7 table 2, frame 01           | Severity, state, visibility, environment and connector badges, AI marker, confidence indicator, clock, restricted placeholder, owner chip, metric card, hypothesis card, evidence item, action card, timeline event, task item | `feat/relyxus-domain-components`         |
| 7   | Localisation and Right-to-Left | UI/UX s. 6, 16                         | next-intl, English and Arabic catalogues, direction handling, date, duration and money formatting, UTC toggle                                                                                                                  | `feat/localisation-and-rtl`              |
| 8   | Data Access and Live Updates   | Product s. 22A, UI/UX s. 8, 9          | HTTP client, problem details, idempotency, ETag conflicts, Query provider, WebSocket and SSE client, update buffer, new-updates pill                                                                                           | `feat/data-access-and-live-updates`      |
| 9   | Application Shell              | UI/UX s. 3, 4, 8, frame 02, 41         | Top bar, region badge, platform status, sidebar with 13 destinations, workspace switcher, banner slot with reconnect banner, context drawer, command palette, shortcuts, skip link, MSW development fixtures                   | `feat/application-shell`                 |
| 10  | Identity and Session           | Product s. 14, 17; Tech stack s. 9     | Sign-in, OIDC via Keycloak, session expiry return, step-up re-confirmation hook. Blocked on open question Q5                                                                                                                   | `feat/identity-and-session`              |

### Operate

| #   | Capability                  | Specification                               | Figma  | Route                                            | Branch                             |
| --- | --------------------------- | ------------------------------------------- | ------ | ------------------------------------------------ | ---------------------------------- |
| 11  | Command Centre              | UI/UX 10.1; Product 15                      | 03     | `/w/{workspace}/home`                            | `feat/command-centre`              |
| 12  | Incident List               | UI/UX 10.2                                  | 04     | `/w/{workspace}/incidents`                       | `feat/incident-list`               |
| 13  | Incident Declaration        | UI/UX 10.3, flow 4 and 8; Product 8A        | 05     | `/w/{workspace}/incidents/new`                   | `feat/incident-declaration`        |
| 14  | Incident War Room           | UI/UX 10.4, flow 1 and 7; Product 8A, 9, 11 | 06, 39 | `/w/{workspace}/incidents/{incidentId}`          | `feat/incident-war-room`           |
| 15  | Evidence Explorer           | UI/UX 10.5                                  | 07     | `/w/{workspace}/incidents/{incidentId}/evidence` | `feat/evidence-explorer`           |
| 16  | Incident Tasks and Timeline | UI/UX 10.6, 10.7; Product 11                | 08, 09 | war room panels and full views                   | `feat/incident-tasks-and-timeline` |
| 17  | Approval Governance Inbox   | UI/UX 11.1, 11.2, flow 2; Product 10        | 10     | `/w/{workspace}/approvals`                       | `feat/approvals-inbox`             |
| 18  | On-call and Escalation      | UI/UX 13.4; Product 11                      | 28     | `/w/{workspace}/on-call`                         | `feat/on-call-schedules`           |

### Understand

| #   | Capability                       | Specification              | Figma | Route                              | Branch                              |
| --- | -------------------------------- | -------------------------- | ----- | ---------------------------------- | ----------------------------------- |
| 19  | Services and Dependency Map      | UI/UX 13.2; Product 7      | 26    | `/w/{workspace}/services`          | `feat/services-dependency-map`      |
| 20  | Business Services and Tolerances | UI/UX 12.5; Product 8, 12  | 20    | `/w/{workspace}/services/business` | `feat/business-services-tolerances` |
| 21  | Replay and AI Quality            | UI/UX 11.7; Product 9, 13  | 15    | `/w/{workspace}/ai-quality`        | `feat/replay-ai-quality`            |
| 22  | Analytics and Dashboards         | UI/UX 12.7, 17; Product 13 | 22    | `/w/{workspace}/analytics`         | `feat/analytics-dashboards`         |

### Govern

| #   | Capability               | Specification                  | Figma | Route                       | Branch                          |
| --- | ------------------------ | ------------------------------ | ----- | --------------------------- | ------------------------------- |
| 23  | Policies and Autonomy    | UI/UX 11.3, flow 6; Product 10 | 11    | `/w/{workspace}/policies`   | `feat/policies-autonomy`        |
| 24  | Approval Routing Builder | UI/UX 11.4; Product 10         | 12    | policies sub-route          | `feat/approval-routing-builder` |
| 25  | Notification Rules       | UI/UX 11.5; Product 11A        | 13    | policies sub-route          | `feat/notification-rules`       |
| 26  | Runbooks and Playbooks   | UI/UX 11.6; Product 10, 13     | 14    | `/w/{workspace}/runbooks`   | `feat/runbooks-playbooks`       |
| 27  | Compliance Centre        | UI/UX 12.1; Product 12         | 16    | `/w/{workspace}/compliance` | `feat/compliance-centre`        |
| 28  | Regulator Report Editor  | UI/UX 12.2, flow 5             | 17    | compliance sub-route        | `feat/regulator-report-editor`  |
| 29  | Regulatory Rule Library  | UI/UX 12.3; Product 12         | 18    | compliance sub-route        | `feat/regulatory-rule-library`  |
| 30  | Post-Incident Review     | UI/UX 12.4; Product 13         | 19    | incident sub-route          | `feat/post-incident-review`     |
| 31  | Status Pages             | UI/UX 12.6; Product 11         | 21    | communications sub-route    | `feat/status-pages`             |
| 32  | Audit Log                | UI/UX 13.11; Product 14        | 35    | `/w/{workspace}/audit`      | `feat/audit-log`                |

### Configure

| #   | Capability                            | Specification                 | Figma  | Route                                    | Branch                         |
| --- | ------------------------------------- | ----------------------------- | ------ | ---------------------------------------- | ------------------------------ |
| 33  | Integrations Hub and Connector Wizard | UI/UX 13.1, flow 3; Product 7 | 24, 25 | `/w/{workspace}/integrations`            | `feat/integrations-hub`        |
| 34  | Incident Types, Fields and Forms      | UI/UX 13.3; Product 8A        | 27     | `/w/{workspace}/settings/incident-types` | `feat/incident-types-forms`    |
| 35  | Configuration Promotion               | UI/UX 13.5; Product 14A       | 29     | `/org/admin/configuration`               | `feat/configuration-promotion` |
| 36  | Platform Operations                   | UI/UX 13.6; Product 6A        | 30     | `/org/admin/platform`                    | `feat/platform-operations`     |
| 37  | Support Access                        | UI/UX 13.7; Product 17        | 31     | `/org/admin/support-access`              | `feat/support-access`          |
| 38  | Users, Teams and Roles                | UI/UX 13.8; Product 14        | 32     | `/org/admin/users`                       | `feat/users-teams-roles`       |
| 39  | Security and Data Controls            | UI/UX 13.9; Product 17        | 33     | `/org/admin/security`                    | `feat/security-data-controls`  |
| 40  | Personal Settings                     | UI/UX 13.10; Product 14       | 34     | `/me/settings`                           | `feat/personal-settings`       |
| 41  | Onboarding and Sample Workspace       | UI/UX 14; Product 15          | 36     | `/onboarding`                            | `feat/onboarding-setup`        |

### Other surfaces

| #   | Capability                           | Specification          | Figma  | Branch                              |
| --- | ------------------------------------ | ---------------------- | ------ | ----------------------------------- |
| 42  | Mobile Acknowledge and Approve (PWA) | UI/UX 15, flow 2       | 37, 38 | `feat/mobile-incident-and-approval` |
| 43  | Wall Mode                            | UI/UX 15               | 40     | `feat/wall-mode`                    |
| 44  | Trust Centre (separate app)          | UI/UX 12.8; Product 19 | 23     | `feat/trust-centre-app`             |

Routes for admin sub-pages that the UI/UX specification does not list explicitly (for
example `/org/admin/platform`) are proposals and are tracked in the open questions log.

## 5a. Delivery status

Updated as each capability merges into `dev`. Large capabilities get an implementation brief
in [briefs](briefs) before coding.

| #     | Capability                               | Status                                                                              | Pull requests |
| ----- | ---------------------------------------- | ----------------------------------------------------------------------------------- | ------------- |
| 1–9   | Foundations                              | Merged                                                                              | #1 to #9      |
| —     | End-to-end and accessibility harness     | Merged                                                                              | #11           |
| 10    | Identity and Session                     | Blocked on open question Q5 (Keycloak client and session design)                    | —             |
| 11    | Command Centre                           | Merged                                                                              | #12           |
| 12    | Incident List                            | Merged                                                                              | #13           |
| 13    | Incident Declaration                     | Merged                                                                              | #14           |
| 14    | Incident War Room                        | In progress, see [brief](briefs/incident-war-room.md); split into two pull requests | —             |
| 15    | Evidence Explorer                        | Next after the war room                                                             | —             |
| 16    | Incident Tasks and Timeline (full views) | Planned                                                                             | —             |
| 17    | Approval Governance Inbox                | Planned                                                                             | —             |
| 18–44 | Remaining capabilities                   | Planned in the order of section 5                                                   | —             |

## 6. Cross-cutting requirements applied to every screen

Each screen pull request must show evidence of:

1. **States** from UI/UX section 9: loading skeleton in the page's real shape, true empty,
   filtered empty, error with reference ID, degraded connector, Relyxus degraded, stale,
   permission denied, restricted, read only, conflict, expired approval, offline and
   reconnecting, licence grace and partial permission where they apply.
2. **Accessibility**: landmarks, headings, accessible names, visible focus, keyboard paths
   including the shortcuts in UI/UX section 8, 24 px desktop and 44 px touch targets,
   reduced motion, 200 percent zoom, axe checks in component and end-to-end tests.
3. **Arabic RTL**: logical properties, mirrored directional icons, technical content
   isolated as LTR monospace, Arabic catalogue entries.
4. **Copy**: UI/UX section 16 voice and terminology; error formula "what happened + why +
   what to do + reference ID"; AI confidence wording bands.
5. **Responsive behaviour** for the breakpoints in UI/UX section 15; desktop-only screens
   show a "Send link to my desktop" message on mobile.
6. **Acceptance criteria** from the specification automated as Playwright tests.
7. **Performance budgets**: first content under 1.5 s, interactions under 100 ms, live
   updates visible within 1 s. Claimed only when measured.

## 7. Testing strategy

| Layer           | Tool                                | What it proves                                                                                        |
| --------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Unit            | Vitest                              | Formatters, countdowns, buffer logic, permission helpers, schema parsing                              |
| Component       | Vitest + Testing Library + axe-core | Keyboard behaviour, accessible names, state rendering, no axe violations                              |
| Visual workshop | Storybook                           | Every component state in Obsidian dark and Arabic RTL                                                 |
| Contract        | Zod schemas + MSW                   | Screens render real response shapes; later generated from OpenAPI                                     |
| End-to-end      | Playwright + axe                    | Specification acceptance criteria and the eight key flows in UI/UX section 18                         |
| Leakage         | Playwright                          | Restricted incident never appears in lists, search, titles or notifications for unauthorised fixtures |

## 8. CI and governance

GitHub Actions runs on every pull request: install with a frozen lockfile, lint, type check,
unit and component tests, production build. Playwright, Storybook build, dependency
scanning and secret scanning are added as their capabilities land. Branch protection,
CODEOWNERS and required reviewers are configured by repository administrators (open
question Q7).
