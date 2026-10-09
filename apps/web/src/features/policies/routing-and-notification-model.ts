import { z } from 'zod';

import { paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Approval routing (UI/UX s. 11.4) and notification rules (UI/UX s. 11.5; Product s. 10 and
 * 11A). Both screens preview exactly who will be asked or contacted before a change is
 * published; the preview is computed by the server. Provisional contract (ADR 0004).
 */
export const approvalRouteModes = ['staged', 'sequential', 'parallel'] as const;

export const approvalRouteSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mode: z.enum(approvalRouteModes),
  stageCount: z.number().int().positive(),
  quorum: z.number().int().positive(),
});

export const approvalRouteListSchema = paginatedListSchema(approvalRouteSummarySchema);

export const approvalRouteDetailSchema = approvalRouteSummarySchema.extend({
  stages: z.array(
    z.object({
      number: z.number().int().positive(),
      /** Who the stage resolves to, for example "Payments primary on-call". */
      resolver: z.string().min(1),
      quorum: z.number().int().positive(),
    }),
  ),
  isProposerExcluded: z.boolean(),
  /** Minutes before the request moves to the fallback approvers; null when there is none. */
  fallbackAfterMinutes: z.number().int().positive().nullable(),
  isDelegationAllowed: z.boolean(),
  mfaRequirement: z.enum(['always', 'production', 'never']),
  preview: z.object({
    stages: z.array(
      z.object({
        number: z.number().int().positive(),
        approvers: z.array(z.object({ name: z.string().min(1), reason: z.string().min(1) })),
      }),
    ),
    areAllApproversEligible: z.boolean(),
  }),
});
export type ApprovalRouteDetail = z.infer<typeof approvalRouteDetailSchema>;

export const notificationRuleSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  isEnabled: z.boolean(),
  channels: z.array(z.string().min(1)),
});

export const notificationRuleListSchema = paginatedListSchema(notificationRuleSummarySchema);

export const notificationRuleDetailSchema = notificationRuleSummarySchema.extend({
  trigger: z.string().min(1),
  conditions: z.string().min(1),
  recipients: z.array(z.string().min(1)),
  renotifyEveryMinutes: z.number().int().positive().nullable(),
  escalation: z
    .object({ target: z.string().min(1), afterMinutes: z.number().int().positive() })
    .nullable(),
  deliveryPreview: z.array(
    z.object({
      recipientName: z.string().min(1),
      channels: z.array(z.string().min(1)),
      /** Null when the recipient is contacted at once. */
      afterMinutes: z.number().int().positive().nullable(),
    }),
  ),
  /** True when messages about restricted incidents carry no details (Product s. 8A). */
  isRestrictedSafe: z.boolean(),
});
export type NotificationRuleDetail = z.infer<typeof notificationRuleDetailSchema>;
