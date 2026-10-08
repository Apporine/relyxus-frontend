import { z } from 'zod';

import {
  environmentSchema,
  incidentVisibilitySchema,
  isoDateTimeSchema,
  paginatedListSchema,
  severitySchema,
} from '@/lib/domain/schemas';

/*
 * Approval request summary for queues and the Command Centre (UI/UX s. 11.2; Product s. 10).
 * Provisional until the OpenAPI contract is published (ADR 0004).
 */
export const approvalKinds = ['production-action', 'report', 'policy', 'configuration'] as const;
export type ApprovalKind = (typeof approvalKinds)[number];

export const pendingApprovalSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(approvalKinds),
  /** Names the action and its target, for example "Restart payments-api". */
  title: z.string().min(1),
  incidentReference: z.string().nullable(),
  /** Exact target, for example "payments-api / eu-west-2". */
  target: z.string().min(1),
  environment: environmentSchema,
  blastRadius: z.string().min(1),
  quorum: z.object({
    approved: z.number().int().nonnegative(),
    required: z.number().int().positive(),
  }),
  /** Approvals are void after this instant and can never be reused (Product s. 10). */
  expiresAt: isoDateTimeSchema,
});
export type PendingApproval = z.infer<typeof pendingApprovalSchema>;

export const pendingApprovalListSchema = paginatedListSchema(pendingApprovalSchema);

/**
 * Why the signed-in person cannot decide, as explained by the server (UI/UX s. 11.2:
 * approver eligibility is always explained). Null when they can decide.
 */
export const decisionBlockReasons = [
  'waiting-for-others',
  'proposer-excluded',
  'not-eligible',
  'expired',
  'already-decided',
] as const;
export type DecisionBlockReason = (typeof decisionBlockReasons)[number];

export const evidenceSignals = ['change', 'degradation', 'verification'] as const;

/** The full decision surface for one approval request (UI/UX s. 11.1 and 11.2). */
export const approvalDetailSchema = pendingApprovalSchema.extend({
  incident: z
    .object({
      reference: z.string().min(1),
      title: z.string().min(1),
      severity: severitySchema,
      visibility: incidentVisibilitySchema,
    })
    .nullable(),
  requestedByName: z.string().min(1),
  /** Exact command or API call; null for kinds that do not run one. */
  command: z
    .object({
      text: z.string().min(1),
      cluster: z.string().nullable(),
      namespace: z.string().nullable(),
    })
    .nullable(),
  expectedResult: z.string().nullable(),
  evidence: z.array(
    z.object({
      id: z.string().min(1),
      summary: z.string().min(1),
      detail: z.string().min(1),
      signal: z.enum(evidenceSignals),
    }),
  ),
  effectivePolicy: z
    .object({
      name: z.string().min(1),
      constraints: z.array(z.string().min(1)),
      conflicts: z.array(z.string().min(1)),
    })
    .nullable(),
  /** Each consequence step; a null value means the part cannot be shown (UI/UX s. 11.1). */
  consequences: z.object({
    risk: z.string().nullable(),
    rollback: z.string().nullable(),
    verification: z.string().nullable(),
  }),
  mfaRequired: z.boolean(),
  decisionBlockReason: z.enum(decisionBlockReasons).nullable(),
});
export type ApprovalDetail = z.infer<typeof approvalDetailSchema>;

export const approvalDecisionRequestSchema = z.discriminatedUnion('decision', [
  z.object({ decision: z.literal('approve') }),
  /** A production action can only be rejected with a reason (UI/UX s. 11.2). */
  z.object({ decision: z.literal('reject'), reason: z.string().trim().min(1) }),
]);
export type ApprovalDecisionRequest = z.infer<typeof approvalDecisionRequestSchema>;

export const approvalDecisionResponseSchema = z.object({
  outcome: z.enum(['approved', 'approval-recorded', 'rejected']),
  quorum: z.object({
    approved: z.number().int().nonnegative(),
    required: z.number().int().positive(),
  }),
});
export type ApprovalDecisionResponse = z.infer<typeof approvalDecisionResponseSchema>;
