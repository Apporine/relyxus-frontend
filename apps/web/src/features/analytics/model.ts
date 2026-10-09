import { z } from 'zod';

import { impactConfidenceSchema, isoDateTimeSchema, moneySchema } from '@/lib/domain/schemas';

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

/*
 * Reliability analytics (UI/UX s. 12.7 and 17; Product s. 13). Every figure is a catalogue
 * metric with a versioned definition and a named source. Provisional contract (ADR 0004).
 */
export const metricUnits = ['minutes', 'seconds', 'count'] as const;
export type MetricUnit = (typeof metricUnits)[number];

const metricComparisonSchema = z.object({
  current: z.number().nonnegative(),
  prior: z.number().nonnegative(),
});

export const reliabilityAnalyticsSchema = z.object({
  windowDays: z.number().int().positive(),
  metricDefinitionVersion: z.number().int().positive(),
  mttrMinutes: metricComparisonSchema,
  incidentCount: z.number().int().nonnegative(),
  downtimeAvoided: z.object({ minutes: z.number().nonnegative(), isVerified: z.boolean() }),
  customerImpact: moneySchema.extend({ confidence: impactConfidenceSchema }),
  mttrTrend: z.array(
    z.object({ periodStart: isoDateTimeSchema, mttrMinutes: z.number().nonnegative() }),
  ),
  incidentsByBusinessService: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      count: z.number().int().positive(),
    }),
  ),
  drillDowns: z.array(
    metricComparisonSchema.extend({
      metric: z.enum([
        'mttr',
        'time-to-first-hypothesis',
        'downtime-avoided',
        'unapproved-production-changes',
      ]),
      unit: z.enum(metricUnits),
      source: z.string().min(1),
    }),
  ),
});
export type ReliabilityAnalytics = z.infer<typeof reliabilityAnalyticsSchema>;
