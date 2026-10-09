# Implementation brief: Business Services and Tolerances

Capability 20 in the [implementation plan](../implementation-plan.md). Written before coding,
as engineering contract section 53 requires for large features.

## Requirement

The operational resilience view. For each important business service, a resilience owner
can explain how long remains before its impact tolerance is breached and which technical
services it depends on, without technical digging (UI/UX s. 12.5 acceptance). Every
money-at-risk value shows its formula, source, timestamp and confidence, and manual
overrides are visibly marked (Product s. 8, business impact model).

## Authoritative sources

| Source                        | Sections                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| UI/UX Master Design Spec v2.0 | 12.5 Business services and tolerances, 9 Screen states, 15 Breakpoints                        |
| Master Product Specification  | 8 Business impact model; 12 Impact-tolerance tracker and downtime budget; 20 Business Service |
| Obsidian design package       | Figma frame 20 (list, tolerance detail, current posture)                                      |

## Layout

- Route `/w/{workspace}/services/business`, inside the Services area. Both service pages
  share a two-link sub-navigation: Technical services and Business services.
- From 1440 px: list (320 px), tolerance detail, and the current posture column (270 px), as
  in frame 20. Below that the columns stack. The selected service lives in `?service=`.

## Content

- **List:** name, health in words, and a live "time to breach" while the service is disrupted.
- **Tolerance detail:**
  - time to breach as the shared clock widget, with tolerance phase words at 50, 75 and 90
    percent (Product s. 12);
  - the downtime budget used and remaining for its period (for example MAS's four hours a year);
  - current impact with its formula version, source, time and confidence;
  - the impact formula settings from Product s. 8;
  - technical dependencies with their health, each linking to the dependency map;
  - regulators, owner, breach history and the last resilience drill.
- **Current posture:** health, impact source freshness, tolerance consumed, and any manual
  override with who made it and why.

## States

| State (UI/UX s. 12.5) | Treatment                                                                             |
| --------------------- | ------------------------------------------------------------------------------------- |
| Near breach           | Clock phase words from 50 percent; the posture column reads "Near breach"             |
| Breached              | Clock reads "Tolerance breached"; the time outside tolerance is shown                 |
| Impact source missing | Warning banner naming the source and the fallback assumption; posture reads "Missing" |
| Manual override       | The value is marked "Overridden", with who, when and the audited reason               |
| Rule version changed  | Info banner: which formula version applied before and when it changed                 |

## Actions

Edit mapping or tolerance (which needs policy-owner approval), configure the impact formula,
start a resilience drill and add a business service are shown disabled with the reason. Their
contracts and approval flow are open question Q19. Reviewing past breaches is the breach
history list.

## Provisional contract (ADR 0004)

- `GET /workspaces/{slug}/business-services` lists every business service. The Command
  Centre keeps its `?health=not-healthy` filter.
- `GET /workspaces/{slug}/business-services/{id}` returns the detail.

## Tests

- Unit: tolerance figures (time to breach, consumed share, budget remaining).
- Component: list, detail, posture, each state, links to technical services, no-access.
- End-to-end with axe: desktop view, Arabic, and moving between technical and business
  services.
