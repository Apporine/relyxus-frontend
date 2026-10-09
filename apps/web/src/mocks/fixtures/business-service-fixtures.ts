import type { BusinessServiceDetail, BusinessServiceSummary } from '@/features/services/model';

import { technicalServicesLinkedTo } from './service-fixtures';

/*
 * DEVELOPMENT FIXTURE. Important business services for the Payments / UK demo workspace
 * (Figma frame 20). Card payments is near breach with a formula version change during the
 * disruption; Settlement is degraded with stale impact data and a manual override; Customer
 * login has no impact source; Merchant onboarding has no technical services mapped yet.
 */

const DEMO_WORKSPACE_SLUG = 'payments-uk';
const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 24 * 60 * MILLISECONDS_PER_MINUTE;

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * MILLISECONDS_PER_MINUTE).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * MILLISECONDS_PER_DAY).toISOString();

type BusinessServiceFixture = Omit<BusinessServiceDetail, 'technicalServices'>;

const cardPaymentsDisruptionMinutes = 34;

function businessServiceFixtures(): BusinessServiceFixture[] {
  return [
    {
      id: 'svc-card-payments',
      name: 'Card payments',
      health: 'at-risk',
      tolerance: {
        toleranceMinutes: 45,
        disruptionStartedAt: minutesAgo(cardPaymentsDisruptionMinutes),
        state: 'near-breach',
      },
      ownerTeamName: 'Payments platform',
      regulators: ['DORA', 'UK Operational Resilience'],
      downtimeBudget: { period: 'month', allowedMinutes: 120, usedMinutes: 71 },
      impact: {
        current: {
          amountInMinorUnits: 18_400_000,
          currencyCode: 'GBP',
          confidence: 'measured',
          calculatedAt: minutesAgo(1),
        },
        sourceState: 'fresh',
        formula: {
          version: 8,
          expression: 'Failed authorisations × average ticket × fee margin',
          metricName: 'Failed card authorisations per minute',
          sourceName: 'Prometheus',
          currencyCode: 'GBP',
          freshnessLimitMinutes: 2,
          fallbackAssumption: 'Same hour over the last 4 weeks, average revenue per minute',
        },
        override: null,
        ruleVersionChange: {
          previousVersion: 7,
          changedAt: minutesAgo(cardPaymentsDisruptionMinutes - 12),
        },
        severityThresholds: [
          { severity: 'SEV1', condition: 'Above 500 failed authorisations a minute' },
          { severity: 'SEV2', condition: 'Above 100 failed authorisations a minute' },
          { severity: 'SEV3', condition: 'Above 20 failed authorisations a minute' },
        ],
      },
      breachHistory: [
        // The incident behind this breach is restricted, so the server omits its reference.
        {
          id: 'breach-card-1',
          incidentReference: null,
          startedAt: daysAgo(42),
          minutesOutsideTolerance: 12,
        },
      ],
      lastDrillAt: daysAgo(61),
    },
    {
      id: 'svc-settlement',
      name: 'Settlement',
      health: 'degraded',
      tolerance: { toleranceMinutes: 240, disruptionStartedAt: minutesAgo(106), state: 'within' },
      ownerTeamName: 'Settlement',
      regulators: ['UK Operational Resilience'],
      downtimeBudget: { period: 'quarter', allowedMinutes: 480, usedMinutes: 130 },
      impact: {
        current: {
          amountInMinorUnits: 2_600_000,
          currencyCode: 'GBP',
          confidence: 'estimated',
          calculatedAt: minutesAgo(9),
        },
        sourceState: 'stale',
        formula: {
          version: 3,
          expression: 'Delayed settlements × average value × daily funding cost',
          metricName: 'Settlement batches waiting',
          sourceName: 'Datadog',
          currencyCode: 'GBP',
          freshnessLimitMinutes: 5,
          fallbackAssumption: 'Average queue cost over the last 7 days',
        },
        override: {
          amount: { amountInMinorUnits: 4_000_000, currencyCode: 'GBP' },
          reason: 'Month-end volumes are twice the 7-day average.',
          overriddenByName: 'Daniel Okafor',
          overriddenAt: minutesAgo(40),
        },
        ruleVersionChange: null,
        severityThresholds: [
          { severity: 'SEV1', condition: 'More than 2 hours of settlement delay' },
          { severity: 'SEV2', condition: 'More than 30 minutes of settlement delay' },
        ],
      },
      breachHistory: [
        {
          id: 'breach-settlement-1',
          incidentReference: 'INC-2031',
          startedAt: daysAgo(9),
          minutesOutsideTolerance: 35,
        },
      ],
      lastDrillAt: daysAgo(130),
    },
    {
      id: 'svc-customer-login',
      name: 'Customer login',
      health: 'healthy',
      tolerance: { toleranceMinutes: 30, disruptionStartedAt: null, state: 'within' },
      ownerTeamName: 'Identity',
      regulators: ['UK Operational Resilience'],
      downtimeBudget: { period: 'year', allowedMinutes: 240, usedMinutes: 30 },
      impact: {
        current: null,
        sourceState: 'missing',
        formula: {
          version: 2,
          expression: 'Failed sign-ins × abandonment rate × average basket',
          metricName: 'Failed sign-ins per minute',
          sourceName: 'Grafana Loki',
          currencyCode: 'GBP',
          freshnessLimitMinutes: 5,
          fallbackAssumption: 'Same weekday last month, average sign-ins per minute',
        },
        override: null,
        ruleVersionChange: null,
        severityThresholds: [],
      },
      breachHistory: [],
      lastDrillAt: null,
    },
    {
      id: 'svc-merchant-onboarding',
      name: 'Merchant onboarding',
      health: 'healthy',
      tolerance: { toleranceMinutes: 1_440, disruptionStartedAt: null, state: 'within' },
      ownerTeamName: null,
      regulators: [],
      downtimeBudget: { period: 'month', allowedMinutes: 600, usedMinutes: 0 },
      impact: {
        current: {
          amountInMinorUnits: 0,
          currencyCode: 'GBP',
          confidence: 'measured',
          calculatedAt: minutesAgo(1),
        },
        sourceState: 'fresh',
        formula: {
          version: 1,
          expression: 'Applications waiting × expected first-month revenue',
          metricName: 'Applications waiting for review',
          sourceName: 'ServiceNow',
          currencyCode: 'GBP',
          freshnessLimitMinutes: 60,
          fallbackAssumption: 'Average applications per day last quarter',
        },
        override: null,
        ruleVersionChange: null,
        severityThresholds: [],
      },
      breachHistory: [],
      lastDrillAt: daysAgo(200),
    },
  ];
}

function isDemoWorkspace(workspaceSlug: string): boolean {
  return workspaceSlug === DEMO_WORKSPACE_SLUG;
}

export function businessServiceSummariesFor(workspaceSlug: string): BusinessServiceSummary[] {
  if (!isDemoWorkspace(workspaceSlug)) {
    return [];
  }
  return businessServiceFixtures().map(({ id, name, health, tolerance }) => ({
    id,
    name,
    health,
    tolerance,
  }));
}

export function businessServiceDetailFor(
  workspaceSlug: string,
  businessServiceId: string,
): BusinessServiceDetail | null {
  const fixture = isDemoWorkspace(workspaceSlug)
    ? businessServiceFixtures().find((businessService) => businessService.id === businessServiceId)
    : undefined;
  return fixture === undefined
    ? null
    : { ...fixture, technicalServices: technicalServicesLinkedTo(businessServiceId) };
}
