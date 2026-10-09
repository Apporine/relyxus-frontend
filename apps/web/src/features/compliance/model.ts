import { z } from 'zod';

import { isoDateTimeSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Regulator clock (Product s. 12 and 20). Every clock carries the rule package version that
 * governs it, so nobody relies on an unvalidated rule without knowing. Provisional contract
 * (ADR 0004).
 */
export const regulatorClockSchema = z.object({
  id: z.string().min(1),
  /** Obligation name, for example "DORA initial notice". */
  obligationName: z.string().min(1),
  incidentReference: z.string().min(1),
  /** Rule package and version, for example "EU DORA v1.2". */
  rulePackage: z.string().min(1),
  ownerName: z.string().min(1),
  startedAt: isoDateTimeSchema,
  deadlineAt: isoDateTimeSchema,
  isSubmitted: z.boolean(),
});
export type RegulatorClock = z.infer<typeof regulatorClockSchema>;

export const regulatorClockListSchema = paginatedListSchema(regulatorClockSchema);

/*
 * Compliance Centre overview (UI/UX s. 12.1; Product s. 12): incidents needing compliance
 * attention, the nearest obligations and evidence pack completeness. Incidents the viewer
 * may not open are omitted by the server. Provisional contract (ADR 0004).
 */
export const complianceClassifications = [
  'major-ict',
  'reportable',
  'review-needed',
  'not-reportable',
] as const;
export const complianceReportStates = [
  'none',
  'draft',
  'submitted',
  'amendment',
  'closed',
] as const;

export const complianceOverviewSchema = z.object({
  incidents: z.array(
    z.object({
      reference: z.string().min(1),
      title: z.string().min(1),
      classification: z.enum(complianceClassifications),
      clock: z.object({ deadlineAt: isoDateTimeSchema, isSubmitted: z.boolean() }).nullable(),
      reportState: z.enum(complianceReportStates),
      /** The regulator report for this incident, when one exists. */
      reportId: z.string().nullable(),
      ownerName: z.string().nullable(),
    }),
  ),
  deadlines: z.array(
    z.object({
      id: z.string().min(1),
      obligationName: z.string().min(1),
      /** What the obligation concerns, for example an incident or a rule package. */
      subject: z.string().min(1),
      dueAt: isoDateTimeSchema,
    }),
  ),
  evidencePacks: z.array(
    z.object({
      incidentReference: z.string().min(1),
      completenessPercent: z.number().min(0).max(100),
      missingSourceCount: z.number().int().nonnegative(),
    }),
  ),
});
export type ComplianceOverview = z.infer<typeof complianceOverviewSchema>;
