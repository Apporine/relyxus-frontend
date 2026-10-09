# Implementation brief: Services and Dependency Map

Capability 19 in the [implementation plan](../implementation-plan.md). Written before coding,
as engineering contract section 53 requires for large features.

## Requirement

A searchable catalogue of technical services and a map of what each one depends on, so a
responder can move from an incident to dependency evidence in one interaction (UI/UX s. 13.2
acceptance). One real service appears once, however many tools discover it, and every
disagreement between sources is visible rather than merged silently (Product s. 7, service
catalogue lifecycle).

## Authoritative sources

| Source                        | Sections                                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| UI/UX Master Design Spec v2.0 | 13.2 Services and dependency map, 9 Screen states, 15 Breakpoints                           |
| Master Product Specification  | 7 Connect (auto-discovery, service mapping, catalogue lifecycle), 20 Service and Dependency |
| Technology stack              | React Flow for dependency maps                                                              |
| Obsidian design package       | Figma frame 26 (service list beside the dependency map in focus mode)                       |

## Layout

- Page header "Services and dependency map" with the primary action "Add service".
- From 1440 px (`(min-width: 90rem)`): service list (about 330 px) beside the service area;
  below that the list stacks above the service area.
- The service area holds the dependency map in focus mode, then the service detail with the
  nine tabs from UI/UX s. 13.2: Overview, Dependencies, SLOs, Incidents, Changes, Policies,
  Owners, Vendors and regions, History.
- Selection (`?service=`), tab (`?tab=`) and search (`?q=`) live in the URL so a link from an
  incident reopens exactly that view.

## Dependency map

- React Flow 12, read-only: nodes cannot be dragged or connected; the canvas pans and zooms.
- Focus mode is the only mode: the selected service in the centre, the services that depend
  on it on the inline-start side and what it depends on (services, vendors, cloud regions) on
  the inline-end side. The layout mirrors in Arabic.
- More than six neighbours on one side are grouped into one "+N more" node that opens the
  Dependencies tab. This keeps a 1,000+ service graph readable without drawing it whole.
- Each node is a link that moves the focus to that service; nodes are not separate tab stops
  from their link. Health is written as a word on the node, never colour alone.
- The Dependencies tab is the text alternative to the map: the same neighbours in a list with
  dependency type and health.

## States

| State (UI/UX s. 13.2)  | Treatment                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| Unconfirmed discovery  | "Unconfirmed" marker in the list; detail banner with "Confirm service" (a human confirms, s. 7)   |
| Conflicting sources    | Marker in the list; Overview lists each conflicting field, every source's value and which applied |
| No owner               | "No owner" in the list and Owners tab, naming the team it routes to instead                       |
| Stale owner            | "Owner not confirmed this quarter" in the list and Owners tab                                     |
| Stale service          | "Stale: no telemetry or source update for 30 days"                                                |
| Retired or deprecated  | Lifecycle word in the list; retired keeps full incident history                                   |
| Vendor outage          | Warning banner above the map naming the vendor; the vendor node reads "Outage"                    |
| 1,000+ node graph      | Focus mode with grouped neighbours, as above                                                      |
| Empty, filtered empty  | First-use empty state; "No services match" with a clear-search action                             |
| Loading, error, denied | Shared page and section states; a missing or hidden service shows the shared no-access state      |

## Actions in this pull request

- **Confirm service** for unconfirmed discoveries: `POST .../services/{id}/confirmation` with an
  idempotency key; disabled while the live connection is down.
- **View dependencies** from the war room header: each affected service links to
  `/services?service={id}&tab=dependencies`, so the acceptance criterion is one interaction.
- Add service, edit mappings, merge duplicates, retire, assign owner, link a business service,
  and set tier and SLO are shown disabled with the reason. Their write contracts (merge review
  queue, approval for tier changes, CMDB write-back) are open question Q18.

## Provisional contract (ADR 0004)

- `GET /workspaces/{slug}/services?search=` lists summaries.
- `GET /workspaces/{slug}/services/{id}` returns the detail for every tab.
- `GET /workspaces/{slug}/services/{id}/dependencies` returns the direct neighbours.
- `POST /workspaces/{slug}/services/{id}/confirmation` confirms a discovered service.
- Recent incidents the viewer may not see are omitted by the server.

## Tests

- Unit: focus-map layout (sides, grouping, mirroring).
- Component: list markers, search, tabs, confirm action, vendor outage banner, no-access.
- End-to-end with axe: desktop list and map, war room to dependency evidence in one click, Arabic.
