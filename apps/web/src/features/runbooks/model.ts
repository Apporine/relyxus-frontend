import { z } from 'zod';

import { isoDateTimeSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Runbooks and playbooks (UI/UX s. 11.6; Product s. 10 and 13). Each step is a read check,
 * a gate, a gated action, a verification or a manual confirmation. Provisional contract
 * (ADR 0004).
 */
export const runbookSources = ['git', 'manual'] as const;
export const runbookStepKinds = ['read', 'gate', 'action', 'verify', 'manual'] as const;
export type RunbookStepKind = (typeof runbookStepKinds)[number];

export const runbookSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  source: z.enum(runbookSources),
  version: z.number().int().positive(),
  lastTestedAt: isoDateTimeSchema.nullable(),
  isReviewDue: z.boolean(),
});
export type RunbookSummary = z.infer<typeof runbookSummarySchema>;

export const runbookListSchema = paginatedListSchema(runbookSummarySchema);

export const runbookDetailSchema = runbookSummarySchema.extend({
  steps: z.array(
    z.object({
      number: z.number().int().positive(),
      kind: z.enum(runbookStepKinds),
      description: z.string().min(1),
    }),
  ),
  latestRun: z
    .object({
      incidentReference: z.string().min(1),
      result: z.enum(['succeeded', 'failed', 'partially-failed']),
      version: z.number().int().positive(),
      isVersionPinned: z.boolean(),
      /** What happened to steps that had already run when a run failed part way. */
      recovery: z.string().min(1),
    })
    .nullable(),
});
export type RunbookDetail = z.infer<typeof runbookDetailSchema>;
