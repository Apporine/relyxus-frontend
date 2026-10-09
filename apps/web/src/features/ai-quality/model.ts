import { z } from 'zod';

import { isoDateTimeSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Replay and AI quality (UI/UX s. 11.7; Product s. 9, 10 and 20). Provisional contract
 * (ADR 0004). Rates are percentages from 0 to 100; changes are in percentage points
 * against the previous window of the same length.
 */

const percentageSchema = z.number().min(0).max(100);

const rateSchema = z.object({
  percent: percentageSchema,
  changePoints: z.number(),
});
export type Rate = z.infer<typeof rateSchema>;

export const missDimensions = ['type', 'service', 'model'] as const;
export type MissDimension = (typeof missDimensions)[number];

const missCountSchema = z.object({ label: z.string().min(1), count: z.number().int().positive() });
export type MissCount = z.infer<typeof missCountSchema>;

export const calibrationBucketSchema = z.object({
  /** Mean confidence the AI stated for hypotheses in this bucket. */
  predictedPercent: percentageSchema,
  /** How often those hypotheses turned out to be the real cause. */
  actualPercent: percentageSchema,
  sampleSize: z.number().int().positive(),
});
export type CalibrationBucket = z.infer<typeof calibrationBucketSchema>;

export const scorecardSchema = z.object({
  windowDays: z.number().int().positive(),
  incidentsScored: z.number().int().nonnegative(),
  /** Fewer scored incidents than this and the rates are not shown (not enough data). */
  minimumIncidents: z.number().int().positive(),
  correctFirst: rateSchema,
  topThree: rateSchema,
  medianTimeToFirstHypothesisSeconds: z.number().nonnegative(),
  missCount: z.number().int().nonnegative(),
  /** Set when a metric dropped beyond the agreed tolerance (Product s. 9, release gate). */
  regression: z
    .object({
      metric: z.enum(['correct-first', 'top-three', 'calibration']),
      dropPoints: z.number().positive(),
      tolerancePoints: z.number().positive(),
      routeName: z.string().min(1),
    })
    .nullable(),
  calibration: z.array(calibrationBucketSchema),
  misses: z.object({
    type: z.array(missCountSchema),
    service: z.array(missCountSchema),
    model: z.array(missCountSchema),
  }),
});
export type Scorecard = z.infer<typeof scorecardSchema>;

export const modelRouteRoles = ['primary', 'fallback', 'shadow', 'legacy'] as const;
export const modelRouteStatuses = [
  'approved',
  'shadow',
  'pending-approval',
  'deprecated',
  'unavailable',
] as const;
export type ModelRouteStatus = (typeof modelRouteStatuses)[number];

export const modelRouteSchema = z.object({
  id: z.string().min(1),
  role: z.enum(modelRouteRoles),
  name: z.string().min(1),
  modelVersion: z.string().min(1),
  isPinned: z.boolean(),
  region: z.string().min(1),
  /** The data residency the route keeps to, for example "UK only". */
  residency: z.string().min(1),
  /** False when using this route would send data outside the workspace's allowed regions. */
  isResidencyCompatible: z.boolean(),
  status: z.enum(modelRouteStatuses),
  /** Provider retirement date of the pinned version, when announced. */
  retiresAt: isoDateTimeSchema.nullable(),
  lastReplayAt: isoDateTimeSchema.nullable(),
  accuracyPercent: percentageSchema.nullable(),
  approval: z
    .object({
      approvedByName: z.string().min(1),
      approvedAt: isoDateTimeSchema,
      /** The replay run whose results justified the approval. */
      replayRunId: z.string().min(1),
    })
    .nullable(),
});
export type ModelRoute = z.infer<typeof modelRouteSchema>;

export const modelRouteListSchema = paginatedListSchema(modelRouteSchema);

export const replayRunStatuses = ['queued', 'running', 'completed', 'failed'] as const;

export const replayRunSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(replayRunStatuses),
  routeName: z.string().min(1),
  incidentsTested: z.number().int().nonnegative(),
  startedAt: isoDateTimeSchema,
  /** Running replays only. */
  progressPercent: percentageSchema.nullable(),
  estimatedCompletionAt: isoDateTimeSchema.nullable(),
  /** Completed replays only. */
  results: z
    .object({
      correctFirstPercent: percentageSchema,
      topThreePercent: percentageSchema,
      minutesSavedPerIncident: z.number().nonnegative(),
      completedAt: isoDateTimeSchema,
    })
    .nullable(),
});
export type ReplayRunSummary = z.infer<typeof replayRunSummarySchema>;

export const replayRunListSchema = paginatedListSchema(replayRunSummarySchema);

export const replayOutcomes = ['correct-first', 'top-three', 'missed'] as const;
export type ReplayOutcome = (typeof replayOutcomes)[number];

const replayIncidentSchema = z.object({
  incidentReference: z.string().min(1),
  incidentTitle: z.string().min(1),
  outcome: z.enum(replayOutcomes),
  /** The cause the incident commander confirmed when closing the incident. */
  actualCause: z.string().min(1),
  topHypothesis: z.string().min(1),
  topHypothesisConfidencePercent: percentageSchema,
  /** Present for misses: why the AI did not reach the real cause. */
  missReason: z.string().nullable(),
  /** Queries only saw data that existed before this moment (time-fenced replay). */
  evidenceCutoffAt: isoDateTimeSchema,
  decisionTrace: z.array(
    z.object({ step: z.number().int().positive(), summary: z.string().min(1) }),
  ),
});
export type ReplayIncident = z.infer<typeof replayIncidentSchema>;

export const replayRunDetailSchema = replayRunSummarySchema.extend({
  modelVersion: z.string().min(1),
  promptVersion: z.string().min(1),
  incidents: z.array(replayIncidentSchema),
});
export type ReplayRunDetail = z.infer<typeof replayRunDetailSchema>;
