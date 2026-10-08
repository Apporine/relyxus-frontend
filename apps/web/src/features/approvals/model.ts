import { z } from 'zod';

import { environmentSchema, isoDateTimeSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Approval request summary for queues and the Command Centre (UI/UX s. 11.2; Product s. 10).
 * Provisional until the OpenAPI contract is published (ADR 0004).
 */
export const approvalKinds = ['production-action', 'report', 'policy', 'configuration'] as const;

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
