import { z } from 'zod';

import { isoDateTimeSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Regulator report editor (UI/UX s. 12.2) and regulatory rule library (UI/UX s. 12.3;
 * Product s. 12). Every report field shows its sources and authorship; gaps are highlighted,
 * never filled with guessed text. Provisional contract (ADR 0004).
 */
export const reportFieldStatuses = ['complete', 'ai-suggested', 'needs-input'] as const;
export type ReportFieldStatus = (typeof reportFieldStatuses)[number];

export const reportStages = ['draft', 'in-review', 'approved', 'submitted'] as const;

export const regulatorReportSchema = z.object({
  id: z.string().min(1),
  obligationName: z.string().min(1),
  incidentReference: z.string().min(1),
  jurisdiction: z.string().min(1),
  rulePackage: z.string().min(1),
  stage: z.enum(reportStages),
  deadlineAt: isoDateTimeSchema,
  /** Sentences the AI wrote without a source; must be zero before review. */
  guessedTextCount: z.number().int().nonnegative(),
  fields: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        status: z.enum(reportFieldStatuses),
        value: z.string().nullable(),
        sources: z.array(z.object({ name: z.string().min(1), detail: z.string().min(1) })),
        authorship: z.enum(['human', 'ai-suggested-pending-review', 'ai-accepted']),
        validation: z.enum(['verified', 'unverified']),
        isRequired: z.boolean(),
      }),
    )
    .min(1),
});
export type RegulatorReport = z.infer<typeof regulatorReportSchema>;
export type ReportField = RegulatorReport['fields'][number];

export const rulePackageSummarySchema = z.object({
  id: z.string().min(1),
  jurisdiction: z.string().min(1),
  name: z.string().min(1),
});

export const rulePackageListSchema = paginatedListSchema(rulePackageSummarySchema);

export const rulePackageDetailSchema = rulePackageSummarySchema.extend({
  effectiveFrom: isoDateTimeSchema,
  /** Who signed the package off, for example "Legal and Compliance". */
  signedOffBy: z.string().nullable(),
  clockRuleCount: z.number().int().nonnegative(),
  templates: z.array(z.string().min(1)),
  activatedWorkspaceCount: z.number().int().nonnegative(),
  reviewDueAt: isoDateTimeSchema,
  conflicts: z.array(z.string().min(1)),
  versions: z.array(
    z.object({
      version: z.number().int().positive(),
      state: z.enum(['active', 'superseded', 'draft']),
      effectiveFrom: isoDateTimeSchema,
    }),
  ),
});
export type RulePackageDetail = z.infer<typeof rulePackageDetailSchema>;
