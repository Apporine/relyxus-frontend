# Implementation brief: Incident War Room

Capability 14 in the [implementation plan](../implementation-plan.md). Written before coding,
as engineering contract section 53 requires for large features.

## Requirement

The one authoritative screen for running an incident. A responder new to the incident must
understand impact, likely cause, current work, pending decisions and clocks within two
minutes, and updates must arrive within one second without moving what is being read.

## Authoritative sources

| Source                        | Sections                                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX Master Design Spec v2.0 | 10.4 War room, 10.6 Tasks, 10.7 Timeline, 11.1 Approval card anatomy, 8 Live updates and shortcuts, 9 Screen states, 15 Breakpoints, 18 Flows 1 and 7 |
| Master Product Specification  | 8A Lifecycle, visibility and restricted incidents; 9 Investigation; 10 Actions and approvals; 11 Tasks and handoff; 12 Regulator clocks               |
| Obsidian design package       | Figma frames 06 (desktop war room) and 39 (tablet war room)                                                                                           |

## Delivery split

The war room is delivered in two pull requests so each stays reviewable.

| Pull request                             | Scope                                                                                                                                                                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feat/incident-war-room` (this brief)    | Header with impact, nearest clock and Acknowledge; investigation panel; decisions panel (action cards, clocks, communications); timeline and tasks panel; responsive panels; live updates; access and degraded states; shortcuts A and E |
| `feat/incident-war-room-controls` (next) | Change state and severity (confirmation ladder level 1 with reason), commander handoff (flow 7), add note (N), create task (T), chat bridge                                                                                              |

Deciding an approval stays in the Approvals capability (17): the war room's action card
links to the request, where multi-factor re-confirmation and the reason-on-reject rules
live once.

## Layout

| Region          | Content                                                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Header (sticky) | Severity, reference, title, state, environment, visibility; money at risk, failed transactions, age; nearest regulator clock; Acknowledge |
| Left panel      | Timeline and Tasks, switchable by tab (tab state in the URL)                                                                              |
| Centre panel    | AI investigation: summary with the AI marker and evidence count, ranked hypotheses, "what was checked" for low confidence                 |
| Right panel     | Pending actions as nine-part action cards, active clocks, communications (next update due, drafts waiting)                                |

Breakpoints (UI/UX s. 15): three panels from 1440 px; below that the panels become tabs
(Investigation, Decisions, Activity) under the sticky header. The header, the nearest clock
and any pending decision stay visible in every layout.

## Provisional API contract (ADR 0004)

| Endpoint (below `/api/v1/workspaces/{workspace}/incidents/{reference}`) | Purpose                                                               |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `GET` (the incident itself)                                             | Header: identity, severity, state, impact, commander, acknowledgement |
| `GET /investigation`                                                    | Status, AI summary with provenance, ranked hypotheses                 |
| `GET /actions?status=pending`                                           | Proposed actions with all nine card parts                             |
| `GET /clocks`                                                           | Regulator and tolerance clocks for this incident                      |
| `GET /communications`                                                   | Next stakeholder update due and drafts waiting                        |
| `GET /timeline`, `GET /tasks`                                           | Activity panel                                                        |
| `POST /acknowledgements`                                                | Acknowledge, with an idempotency key                                  |

Each panel has its own query so one failing source never blanks the screen.

## Security considerations

- Restricted incidents: a `403` and a `404` render the same "You don't have access to this
  item" state, so the page never confirms that a hidden incident exists (Product s. 8A).
  The document title uses only the reference already present in the URL.
- Acknowledge and every later state change are disabled while the live connection is
  reconnecting (UI/UX s. 8) and are revalidated by the server.
- AI content always carries the AI marker; every hypothesis links to its evidence.

## States (UI/UX s. 9 and 10.4)

Loading in panel shape; no access; AI investigating; low confidence (what was checked);
connector degraded (on evidence and investigation); approval pending, expired or blocked;
action executing or verifying; regulator clock active; Relyxus degraded and reconnecting
(shell banners); acknowledged.

## Testing plan

- Component tests: header impact and acknowledgement, investigation states, action card
  gating, timeline buffering, access state, panel tabs.
- Playwright: flow 1 steps 3 to 5 (open war room, read header and AI summary, see the
  proposed action), Arabic layout, no-access state, axe WCAG 2.2 AA.
