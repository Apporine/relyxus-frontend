import { z } from 'zod';

import { environmentSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Policies and autonomy (UI/UX s. 11.3; Product s. 10). The autonomy ladder runs from L0
 * Observe to L4 Automatic; Deny blocks an action outright. The effective result is computed
 * by the server from every policy that applies. Provisional contract (ADR 0004).
 */
export const autonomyLevels = ['deny', 'l0', 'l1', 'l2', 'l3', 'l4'] as const;
export type AutonomyLevel = (typeof autonomyLevels)[number];

export const policyStates = ['draft', 'published', 'active'] as const;

export const policySummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  autonomy: z.enum(autonomyLevels),
  state: z.enum(policyStates),
});
export type PolicySummary = z.infer<typeof policySummarySchema>;

export const policyListSchema = paginatedListSchema(policySummarySchema);

export const policyDetailSchema = policySummarySchema.extend({
  action: z.string().min(1),
  scope: z.string().min(1),
  environment: environmentSchema,
  approvers: z.string().min(1),
  freezeCalendar: z.string().nullable(),
  effective: z.object({
    result: z.enum(autonomyLevels),
    /** A deny inherited from a broader policy, which always wins. */
    inheritedDeny: z.string().nullable(),
    isRollbackRequired: z.boolean(),
    isVerificationRequired: z.boolean(),
    /** Replayed past actions under this policy: how many would be allowed, need approval or be denied. */
    simulation: z.object({
      allowed: z.number().int().nonnegative(),
      needingApproval: z.number().int().nonnegative(),
      denied: z.number().int().nonnegative(),
    }),
  }),
});
export type PolicyDetail = z.infer<typeof policyDetailSchema>;
