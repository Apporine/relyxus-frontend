/*
 * Product vocabulary shared by Relyxus components and the console's API schemas. Values and
 * meanings come from the Master Product Specification v2.0; the same words are used in the
 * interface, notifications, reports and the API (UI/UX s. 7 and 16).
 */

/** Product s. 8, severity guide. */
export const severityLevels = ['SEV1', 'SEV2', 'SEV3', 'SEV4'] as const;
export type SeverityLevel = (typeof severityLevels)[number];

/** Product s. 8A, lifecycle: six main states and two exits. */
export const incidentStates = [
  'triage',
  'investigating',
  'mitigating',
  'monitoring',
  'resolved',
  'closed',
  'cancelled',
  'merged',
] as const;
export type IncidentState = (typeof incidentStates)[number];

/** Product s. 8A, visibility modes. */
export const incidentVisibilities = [
  'workspace',
  'restricted-group',
  'invite-only',
  'confidential',
] as const;
export type IncidentVisibility = (typeof incidentVisibilities)[number];

/** UI/UX s. 5, environment marking. */
export const environments = ['production', 'staging', 'development'] as const;
export type Environment = (typeof environments)[number];

/** Product s. 7, connector states that can be shown wherever a connector's evidence appears. */
export const connectorHealthStates = ['connected', 'degraded', 'disabled', 'unavailable'] as const;
export type ConnectorHealth = (typeof connectorHealthStates)[number];

/** Product s. 10 and UI/UX s. 7, action card states. */
export const actionStates = [
  'proposed',
  'waiting-for-approval',
  'approved',
  'executing',
  'verifying',
  'succeeded',
  'rolled-back',
  'blocked',
  'expired',
] as const;
export type ActionState = (typeof actionStates)[number];

/** Product s. 11, live incident task statuses. */
export const taskStatuses = ['open', 'in-progress', 'blocked', 'done', 'cancelled'] as const;
export type TaskStatus = (typeof taskStatuses)[number];

/** UI/UX s. 10.7, who produced a timeline event. */
export const timelineActorKinds = ['person', 'ai', 'system', 'external'] as const;
export type TimelineActorKind = (typeof timelineActorKinds)[number];
