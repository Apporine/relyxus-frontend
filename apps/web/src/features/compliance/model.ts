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
