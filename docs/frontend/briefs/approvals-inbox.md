# Implementation brief: Approval Governance Inbox

Capability 17 in the [implementation plan](../implementation-plan.md). Written before coding,
as engineering contract section 53 requires for large features.

## Requirement

The workspace-wide queue where eligible approvers review production actions, regulator reports,
policy changes and configuration promotions. A responder must understand what will happen, why,
who else must agree, and how long they have — then approve, reject with a mandatory reason, or
ask a question — without leaving the operational context of the incident.

Decisions made here are the authoritative place for MFA re-confirmation and reject reasons
(Product s. 10). The war room action card links here; it does not perform the decision itself.

## Authoritative sources

| Source                        | Sections                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| UI/UX Master Design Spec v2.0 | 11.1 Action card anatomy, 11.2 Approvals inbox, 8 Live updates and shortcuts, 9 Screen states, 15 Breakpoints, 18 Flow 2 |
| Master Product Specification  | 10 Actions and approvals; 8A Restricted incidents; 12 Regulator clocks where report approvals appear          |
| Obsidian design package       | Figma frame 10 (desktop Approvals)                                                                            |

## Existing building blocks

| Asset | Location | Reuse |
| ----- | -------- | ----- |
| Pending approval summary schema | `apps/web/src/features/approvals/model.ts` | List rows, header badges |
| Pending approvals query | `apps/web/src/features/approvals/queries.ts` | Extend for inbox sections |
| `approvalHref` | `apps/web/src/features/approvals/routes.ts` | URL selection `?approval=` |
| `ExpiryCountdown` | `apps/web/src/features/approvals/expiry-countdown.tsx` | Queue rows and detail panel |
| `ActionCard` | `@relyxus/ui` | Centre detail for production actions |
| Command Centre decisions panel | `apps/web/src/features/command-centre/decisions-panel.tsx` | Pattern for linking into inbox |
| War room restart action | `war-room-fixtures.ts` / `approval-restart-payments-api` | Primary demo approval |

## Layout (Figma 10)

Three columns from 1280 px; below that: queue list → detail → consequence ladder stacked.

| Region | Content |
| ------ | ------- |
| Header | Title, subtitle, pending count badge |
| Left queue | **Urgent** (assigned to me, expiring soon), **Waiting for others** (visible but not actionable by me). Selected row highlighted; selection in `?approval=` |
| Centre detail | Kind-specific body. Production actions: environment + severity badges, exact command block, expected result, linked evidence rows, effective policy summary with link stub |
| Right ladder | Numbered consequence steps (Target, Blast radius, Risk, Quorum, Rollback, Verify), quorum notice, primary **Approve**, destructive **Reject with reason**, secondary **Ask a question**, large expiry countdown |

Breakpoints (UI/UX s. 15): three columns from 1280 px; queue remains reachable when detail is open on tablet.

## Provisional API contract (ADR 0004)

Base: `/api/v1/workspaces/{workspace}/approvals`

| Endpoint | Purpose |
| -------- | ------- |
| `GET ?status=pending&assignee=me&sort=expires-at` | Urgent queue (exists; used by Command Centre) |
| `GET ?status=pending&assignee=others&sort=expires-at` | Waiting-for-others section |
| `GET /{approvalId}` | Full detail including action card parts, evidence links, consequence ladder, MFA requirement flag |
| `POST /{approvalId}/decisions` | Approve or reject (reject requires `reason`); idempotency key required |
| `POST /{approvalId}/questions` | Ask a question (stub acceptable in first PR if backend contract pending) |

Detail payload extends the list summary with:

- `incidentTitle`, `severity`, `visibility` (for restricted handling)
- `command`, `cluster`, `namespace` (production actions)
- `expectedResult`, `evidenceItems[]`, `policySummary`, `policyHref` (nullable)
- `consequenceLadder[]` (ordered steps with label + value)
- `quorumNotice`, `mfaRequired`, `approveLabel` (may vary by kind)
- `canDecide` (false when waiting for others or expired)

Live events: reuse `pendingApprovalEvents` from `approvals/queries.ts`.

## Security considerations

- Restricted incidents: same 403/404 opaque access pattern as war room and evidence explorer.
- Approve and reject disabled while live connection is reconnecting (UI/UX s. 8).
- Reject without reason is blocked in UI and API.
- MFA re-confirmation: first PR may show the notice and disable Approve with explanatory copy until Identity (Q5) lands; do not fake a working MFA flow.
- Proposer exclusion and expiry are server-enforced; UI surfaces policy text only.

## States (UI/UX s. 9 and 11.2)

Loading in panel shape; empty queue (true empty and filtered empty); error with reference ID;
selected approval load failure; expired approval (read-only detail, no approve); waiting for
others (detail read-only, actions disabled); incomplete action card (missing facts — mirror war
room gating); degraded Relyxus; permission denied; Arabic RTL.

## Delivery split

| Pull request | Scope |
| ------------ | ----- |
| `feat/approvals-inbox` (this brief) | Route `/w/{workspace}/approvals`, three-column layout, queue sections, detail + consequence ladder, URL selection, MSW fixtures, links from Command Centre and war room, e2e + axe |
| Follow-up (optional) | Working approve/reject mutations with optimistic UI, ask-question modal, mobile approval frame 38 |

## Testing plan

- Component tests: queue selection, expiry styling, reject reason validation, incomplete card gating, restricted badge.
- Playwright: open inbox from Command Centre, select restart approval, see command and ladder, reject requires reason, Arabic layout, axe WCAG 2.2 AA.
- Flow 2 (UI/UX s. 18): approve production action from inbox — cover through detail review; decision submit when MFA stub is documented.

## Open questions

| ID | Question | Default for first PR |
| -- | -------- | -------------------- |
| A1 | Exact MFA interaction (WebAuthn step-up vs redirect) | Show requirement; Approve disabled with help text |
| A2 | Report and policy approval detail layouts | List + detail for production-action only; other kinds show title + “detail view coming soon” |
| A3 | Ask a question backend | Disabled button with tooltip |
