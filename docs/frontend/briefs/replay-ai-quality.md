# Implementation brief: Replay and AI Quality

Capability 21 in the [implementation plan](../implementation-plan.md). Written before coding,
as engineering contract section 53 requires for large features.

## Requirement

Prove that the AI works on the customer's own incidents. A model-risk reviewer must be able
to reproduce an evaluation and see why a model was approved (UI/UX s. 11.7 acceptance).
"80% confident" must mean right about 8 times in 10, so calibration is shown, not only
accuracy (Product s. 10, accuracy scorecard).

## Authoritative sources

| Source                        | Sections                                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX Master Design Spec v2.0 | 11.7 Replay and AI quality, 9 Screen states, 17 Charts                                                                            |
| Master Product Specification  | 9 Model governance (release gate, residency, deprecation); 10 Incident Replay, shadow mode, scorecard; 20 Replay Run, Model Route |
| Technology stack              | Apache ECharts for charts (no second chart library)                                                                               |
| Obsidian design package       | Figma frame 15                                                                                                                    |

## Screens

### `/w/{workspace}/ai-quality` (frame 15)

- **Header:** "Replay and AI quality", plus the primary action "Create replay".
- **Scorecards:** correct-first rate, top-three rate, median time to first hypothesis, and
  replay misses. Each rate shows its change in percentage points against the previous window.
- **Calibration chart** (ECharts, SVG renderer, Obsidian colours): predicted confidence
  against actual accuracy, with the perfect-calibration diagonal. The same figures are
  available as a table beside the chart, so nothing is shown only visually.
- **Misses** by type, service and model: a horizontal bar list sorted by frequency, with a
  tab for each dimension (URL-backed).
- **Model routes:** route and role, model version, region, residency, status, last replay
  and accuracy. Each route says who approved it, when, and which replay run justified it.
- **Replay runs:** progress and ETA for running replays; results for completed runs. Each
  run opens its detail.

### `/w/{workspace}/ai-quality/replays/{runId}`

- What was tested, so the run can be reproduced: model route and version, prompt version,
  the incident set, and the time fence (evidence cut-off per incident).
- Per incident: outcome (correct first, in top three, missed), actual cause, the AI's top
  hypothesis, why it missed, and the decision trace.

## States

| State (UI/UX s. 11.7)                | Treatment                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------- |
| Not enough data                      | Scorecards say how many scored incidents exist out of the minimum needed    |
| Model unavailable                    | Danger banner naming the route; reasoning is paused, evidence continues     |
| Regression                           | Warning banner with the metric, the drop and the agreed tolerance           |
| Fallback incompatible with residency | The route row and a banner say the fallback would break residency           |
| Pinned version deprecated            | The route row shows the retirement date; a banner asks for a migration plan |

## Actions

Create a replay, compare models or prompts, approve a model route, start shadow mode and
export a validation pack are shown disabled with the reason: their contracts (incident
selection, approval through the Approvals inbox, export format) are open question Q20.
Inspecting a miss is the replay run detail.

## Provisional contract (ADR 0004)

- `GET /workspaces/{slug}/ai-quality/scorecard`
- `GET /workspaces/{slug}/ai-quality/model-routes`
- `GET /workspaces/{slug}/replay-runs`
- `GET /workspaces/{slug}/replay-runs/{runId}`

## Tests

- Unit: calibration chart option builder, and the rate-change wording.
- Component: scorecards, each state, misses tabs, routes, runs, run detail, no-access.
- End-to-end with axe: the desktop page, opening a replay run, Arabic.
