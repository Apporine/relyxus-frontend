import { actionStates, taskStatuses, timelineActorKinds } from '@relyxus/ui';
import { z } from 'zod';

import { incidentSummarySchema } from '@/features/incidents/model';
import { environmentSchema, isoDateTimeSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * War room data (UI/UX s. 10.4; Product s. 8A, 9, 10, 11). Provisional contracts until the
 * OpenAPI file is published (ADR 0004). Each panel reads its own endpoint so one failing
 * source never blanks the screen.
 */

export const incidentDetailSchema = incidentSummarySchema.extend({
  commanderName: z.string().nullable(),
  /** Null until someone acknowledges; acknowledging stops the escalation chase. */
  acknowledgement: z
    .object({
      acknowledgedByName: z.string().min(1),
      acknowledgedAt: isoDateTimeSchema,
    })
    .nullable(),
});
export type IncidentDetail = z.infer<typeof incidentDetailSchema>;

const hypothesisCommonSchema = z.object({
  id: z.string().min(1),
  rank: z.number().int().positive(),
  cause: z.string().min(1),
  confidencePercent: z.number().min(0).max(100),
  supportingEvidenceCount: z.number().int().nonnegative(),
  refutingEvidenceCount: z.number().int().nonnegative(),
  /** What was checked and ruled out; required wording when confidence is low (UI/UX s. 16). */
  whatWasChecked: z.string().nullable(),
});

/** A ruled-out cause always carries its reason (UI/UX s. 7). */
export const hypothesisSchema = z.discriminatedUnion('status', [
  hypothesisCommonSchema.extend({
    status: z.literal('ruled-out'),
    ruledOutReason: z.string().min(1),
  }),
  hypothesisCommonSchema.extend({ status: z.enum(['under-test', 'confirmed']) }),
]);
export type Hypothesis = z.infer<typeof hypothesisSchema>;

export const investigationStatuses = [
  'investigating',
  'hypotheses-ready',
  'reasoning-paused',
] as const;

export const investigationSchema = z.object({
  status: z.enum(investigationStatuses),
  /** AI-written assessment with its provenance (Product s. 9, model governance). */
  summary: z
    .object({
      text: z.string().min(1),
      modelRoute: z.string().min(1),
      generatedAt: isoDateTimeSchema,
      evidenceCount: z.number().int().nonnegative(),
    })
    .nullable(),
  hypotheses: z.array(hypothesisSchema),
  /** Sources whose evidence may be stale; investigations continue with a visible warning. */
  degradedSources: z.array(
    z.object({ connectorName: z.string().min(1), degradedSince: isoDateTimeSchema }),
  ),
});
export type Investigation = z.infer<typeof investigationSchema>;

/** Every part of the approval card; a null part withholds the decision (UI/UX s. 11.1). */
export const proposedActionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  environment: environmentSchema,
  state: z.enum(actionStates),
  command: z.string().min(1),
  approvalId: z.string().nullable(),
  facts: z.object({
    target: z.string().nullable(),
    rationale: z.string().nullable(),
    policy: z.string().nullable(),
    approvers: z.string().nullable(),
    dryRun: z.string().nullable(),
    verification: z.string().nullable(),
  }),
  expiresAt: isoDateTimeSchema.nullable(),
});
export type ProposedAction = z.infer<typeof proposedActionSchema>;

export const proposedActionListSchema = paginatedListSchema(proposedActionSchema);

export const communicationsSchema = z.object({
  nextStakeholderUpdateDueAt: isoDateTimeSchema.nullable(),
  draftsAwaitingApprovalCount: z.number().int().nonnegative(),
});
export type Communications = z.infer<typeof communicationsSchema>;

/** UI/UX s. 10.7 event categories shown on the full timeline view. */
export const timelineEventTypes = [
  'approval',
  'investigation',
  'role',
  'change',
  'alert',
  'note',
  'task',
] as const;
export type TimelineEventType = (typeof timelineEventTypes)[number];

export const timelineEntrySchema = z.object({
  id: z.string().min(1),
  occurredAt: isoDateTimeSchema,
  actorKind: z.enum(timelineActorKinds),
  actorName: z.string().min(1),
  summary: z.string().min(1),
  needsAttention: z.boolean(),
  /** Present on the full timeline; omitted in the compact war room panel. */
  eventType: z.enum(timelineEventTypes).nullish(),
  contextDetail: z.string().nullish(),
});
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

export const timelineEntryListSchema = paginatedListSchema(timelineEntrySchema);

export const incidentTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(taskStatuses),
  ownerName: z.string().nullable(),
  dueAt: isoDateTimeSchema.nullable(),
  isOverdue: z.boolean(),
  /** Secondary line on kanban cards, for example "waiting" on a blocked approval task. */
  statusDetail: z.string().nullish(),
});
export type IncidentTask = z.infer<typeof incidentTaskSchema>;

export const incidentTaskListSchema = paginatedListSchema(incidentTaskSchema);

export const acknowledgementResponseSchema = z.object({
  acknowledgedByName: z.string().min(1),
  acknowledgedAt: isoDateTimeSchema,
});
