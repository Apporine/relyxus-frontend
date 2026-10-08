import { z } from 'zod';

/*
 * The Command Centre's 24-hour summary. Each figure is a catalogue metric with one
 * definition across every dashboard (Product s. 13). Provisional contract (ADR 0004).
 */
export const lastDaySummarySchema = z.object({
  incidentCount: z.number().int().nonnegative(),
  /** Null when no investigation produced a hypothesis in the period. */
  medianTimeToFirstHypothesisSeconds: z.number().nonnegative().nullable(),
  resolvedWithoutRollbackCount: z.number().int().nonnegative(),
  /** North-star metric that must always be zero (Product s. 1). */
  unapprovedProductionChangeCount: z.number().int().nonnegative(),
});
export type LastDaySummary = z.infer<typeof lastDaySummarySchema>;
