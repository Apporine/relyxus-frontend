import { z } from 'zod';

import {
  environmentSchema,
  impactConfidenceSchema,
  incidentStateSchema,
  isoDateTimeSchema,
  moneySchema,
  paginatedListSchema,
  severitySchema,
} from '@/lib/domain/schemas';

/*
 * Important business services whose impact tolerance is threatened (Product s. 12; UI/UX
 * s. 12.5). Provisional contract (ADR 0004).
 */
export const businessServiceHealthStates = [
  'breached',
  'at-risk',
  'degraded',
  'monitoring',
  'healthy',
] as const;
export type BusinessServiceHealth = (typeof businessServiceHealthStates)[number];

export const businessServiceAtRiskSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  health: z.enum(businessServiceHealthStates),
});
export type BusinessServiceAtRisk = z.infer<typeof businessServiceAtRiskSchema>;

export const businessServiceAtRiskListSchema = paginatedListSchema(businessServiceAtRiskSchema);

/*
 * Technical service catalogue and dependency map (UI/UX s. 13.2; Product s. 7 and 20).
 * Provisional contract (ADR 0004). Lifecycle, staleness and owner confirmation are decided by
 * the server; the client only shows them.
 */
export const serviceTiers = ['tier-0', 'tier-1', 'tier-2', 'tier-3'] as const;
export type ServiceTier = (typeof serviceTiers)[number];

export const serviceHealthStates = ['healthy', 'degraded', 'at-risk', 'outage', 'unknown'] as const;
export type ServiceHealth = (typeof serviceHealthStates)[number];

export const serviceLifecycleStates = ['active', 'deprecated', 'retired'] as const;
export type ServiceLifecycle = (typeof serviceLifecycleStates)[number];

/** Discovered services stay unconfirmed until a person confirms them (Product s. 7). */
export const serviceDiscoveryStates = ['confirmed', 'unconfirmed'] as const;

/** Sources in the order that decides a disagreement, highest priority first (Product s. 7). */
export const serviceSources = ['relyxus-edit', 'cmdb', 'catalogue', 'discovery'] as const;
export type ServiceSource = (typeof serviceSources)[number];

const serviceOwnerSchema = z.object({
  teamName: z.string().min(1),
  /** Owners confirm their services every quarter; true once that confirmation is overdue. */
  isConfirmationOverdue: z.boolean(),
});

export const serviceSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tier: z.enum(serviceTiers),
  health: z.enum(serviceHealthStates),
  lifecycle: z.enum(serviceLifecycleStates),
  discovery: z.enum(serviceDiscoveryStates),
  /** Null when no owner remains, for example after the owner left through SCIM. */
  owner: serviceOwnerSchema.nullable(),
  hasConflictingSources: z.boolean(),
  /** No telemetry and no source update for 30 days. */
  isStale: z.boolean(),
});
export type ServiceSummary = z.infer<typeof serviceSummarySchema>;

export const serviceSummaryListSchema = paginatedListSchema(serviceSummarySchema);

export const sourceConflictFields = [
  'owner',
  'tier',
  'business-service',
  'repository',
  'runtime-location',
] as const;

const sourceConflictSchema = z.object({
  field: z.enum(sourceConflictFields),
  values: z.array(z.object({ source: z.enum(serviceSources), value: z.string().min(1) })).min(2),
  appliedSource: z.enum(serviceSources),
});

const serviceSloSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  objectivePercent: z.number().min(0).max(100),
  attainmentPercent: z.number().min(0).max(100),
  errorBudgetRemainingPercent: z.number().min(0).max(100),
  windowDays: z.number().int().positive(),
});

const serviceIncidentSchema = z.object({
  reference: z.string().min(1),
  title: z.string().min(1),
  severity: severitySchema,
  state: incidentStateSchema,
  declaredAt: isoDateTimeSchema,
});

const serviceChangeSchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  sourceName: z.string().min(1),
  changedAt: isoDateTimeSchema,
});

const servicePolicySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
});

export const externalDependencyKinds = ['vendor', 'cloud-region'] as const;

const externalDependencySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(externalDependencyKinds),
  name: z.string().min(1),
  health: z.enum(serviceHealthStates),
});

const serviceHistoryEntrySchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  actorName: z.string().min(1),
  occurredAt: isoDateTimeSchema,
});

export const serviceDetailSchema = serviceSummarySchema.extend({
  description: z.string().nullable(),
  environments: z.array(environmentSchema),
  businessServices: z.array(z.object({ id: z.string().min(1), name: z.string().min(1) })),
  /** External identifier from each source that knows this service (Product s. 7). */
  sourceRecords: z.array(
    z.object({
      source: z.enum(serviceSources),
      externalId: z.string().min(1),
      lastSyncedAt: isoDateTimeSchema,
    }),
  ),
  conflicts: z.array(sourceConflictSchema),
  /** Team that receives the work while the service has no owner. */
  fallbackTeamName: z.string().min(1),
  ownerConfirmedAt: isoDateTimeSchema.nullable(),
  onCallScheduleName: z.string().nullable(),
  slos: z.array(serviceSloSchema),
  /** Incidents the viewer may not see are omitted by the server. */
  recentIncidents: z.array(serviceIncidentSchema),
  recentChanges: z.array(serviceChangeSchema),
  policies: z.array(servicePolicySchema),
  vendorsAndRegions: z.array(externalDependencySchema),
  history: z.array(serviceHistoryEntrySchema),
});
export type ServiceDetail = z.infer<typeof serviceDetailSchema>;

export const dependencyNodeKinds = ['service', ...externalDependencyKinds] as const;
export type DependencyNodeKind = (typeof dependencyNodeKinds)[number];

export const dependencyTypes = ['calls', 'stores-data-in', 'hosted-in', 'provided-by'] as const;
export type DependencyType = (typeof dependencyTypes)[number];

export const dependencyNeighbourSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(dependencyNodeKinds),
  health: z.enum(serviceHealthStates),
  dependencyType: z.enum(dependencyTypes),
});
export type DependencyNeighbour = z.infer<typeof dependencyNeighbourSchema>;

/** Direct neighbours of one service: what depends on it and what it depends on. */
export const serviceDependenciesSchema = z.object({
  serviceId: z.string().min(1),
  dependents: z.array(dependencyNeighbourSchema),
  dependencies: z.array(dependencyNeighbourSchema),
});
export type ServiceDependencies = z.infer<typeof serviceDependenciesSchema>;

export const serviceConfirmationResponseSchema = z.object({
  serviceId: z.string().min(1),
  discovery: z.literal('confirmed'),
});

/*
 * Business services and tolerances (UI/UX s. 12.5; Product s. 8, 12 and 20). Provisional
 * contract (ADR 0004). Whether a service is near breach is decided by the server; the
 * client counts down to the deadline the server's figures imply.
 */
export const toleranceStates = ['within', 'near-breach', 'breached'] as const;
export type ToleranceState = (typeof toleranceStates)[number];

const toleranceSchema = z.object({
  /** Maximum tolerable disruption, for example 45 minutes for card payments. */
  toleranceMinutes: z.number().int().positive(),
  /** When the current disruption began; null while the service is not disrupted. */
  disruptionStartedAt: isoDateTimeSchema.nullable(),
  state: z.enum(toleranceStates),
});
export type Tolerance = z.infer<typeof toleranceSchema>;

export const businessServiceSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  health: z.enum(businessServiceHealthStates),
  tolerance: toleranceSchema,
});
export type BusinessServiceSummary = z.infer<typeof businessServiceSummarySchema>;

export const businessServiceListSchema = paginatedListSchema(businessServiceSummarySchema);

export const downtimeBudgetPeriods = ['month', 'quarter', 'year'] as const;

export const impactSourceStates = ['fresh', 'stale', 'missing'] as const;
export type ImpactSourceState = (typeof impactSourceStates)[number];

const impactFormulaSchema = z.object({
  version: z.number().int().positive(),
  /** How harm becomes money, for example "Failed authorisations × average ticket × fee margin". */
  expression: z.string().min(1),
  /** The connector query that measures harm, for example "Failed card authorisations per minute". */
  metricName: z.string().min(1),
  sourceName: z.string().min(1),
  currencyCode: z.string().length(3),
  freshnessLimitMinutes: z.number().int().positive(),
  /** Used when live data is missing, for example "Same hour last 4 weeks". */
  fallbackAssumption: z.string().min(1),
});

export const businessServiceDetailSchema = businessServiceSummarySchema.extend({
  ownerTeamName: z.string().nullable(),
  regulators: z.array(z.string().min(1)),
  technicalServices: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      health: z.enum(serviceHealthStates),
    }),
  ),
  downtimeBudget: z.object({
    period: z.enum(downtimeBudgetPeriods),
    allowedMinutes: z.number().int().positive(),
    usedMinutes: z.number().int().nonnegative(),
  }),
  impact: z.object({
    /** The money at risk now; null when no source or fallback can produce a value. */
    current: moneySchema
      .extend({ confidence: impactConfidenceSchema, calculatedAt: isoDateTimeSchema })
      .nullable(),
    sourceState: z.enum(impactSourceStates),
    formula: impactFormulaSchema,
    /** A responder's audited override of the calculated value (Product s. 8). */
    override: z
      .object({
        amount: moneySchema,
        reason: z.string().min(1),
        overriddenByName: z.string().min(1),
        overriddenAt: isoDateTimeSchema,
      })
      .nullable(),
    /** Set when the formula changed during the current disruption. */
    ruleVersionChange: z
      .object({ previousVersion: z.number().int().positive(), changedAt: isoDateTimeSchema })
      .nullable(),
    severityThresholds: z.array(
      z.object({ severity: severitySchema, condition: z.string().min(1) }),
    ),
  }),
  breachHistory: z.array(
    z.object({
      id: z.string().min(1),
      /** Null when the incident is restricted from the viewer or was not recorded as one. */
      incidentReference: z.string().nullable(),
      startedAt: isoDateTimeSchema,
      minutesOutsideTolerance: z.number().int().positive(),
    }),
  ),
  lastDrillAt: isoDateTimeSchema.nullable(),
});
export type BusinessServiceDetail = z.infer<typeof businessServiceDetailSchema>;
