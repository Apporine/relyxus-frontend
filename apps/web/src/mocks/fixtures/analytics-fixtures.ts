import type { ReliabilityAnalytics } from '@/features/analytics/model';

/* DEVELOPMENT FIXTURE. Reliability analytics for the Payments / UK demo (Figma frame 22). */

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;
const weekStart = (weeksAgo: number) =>
  new Date(Date.now() - weeksAgo * 7 * MILLISECONDS_PER_DAY).toISOString();

export function reliabilityAnalyticsFor(workspaceSlug: string): ReliabilityAnalytics | null {
  if (workspaceSlug !== 'payments-uk') {
    return null;
  }
  return {
    windowDays: 30,
    metricDefinitionVersion: 3,
    mttrMinutes: { current: 31, prior: 39 },
    incidentCount: 47,
    downtimeAvoided: { minutes: 318, isVerified: true },
    customerImpact: {
      amountInMinorUnits: 61_200_000,
      currencyCode: 'GBP',
      confidence: 'estimated',
    },
    mttrTrend: [
      { periodStart: weekStart(5), mttrMinutes: 44 },
      { periodStart: weekStart(4), mttrMinutes: 41 },
      { periodStart: weekStart(3), mttrMinutes: 39 },
      { periodStart: weekStart(2), mttrMinutes: 36 },
      { periodStart: weekStart(1), mttrMinutes: 33 },
      { periodStart: weekStart(0), mttrMinutes: 31 },
    ],
    incidentsByBusinessService: [
      { id: 'svc-card-payments', name: 'Card payments', count: 38 },
      { id: 'svc-settlement', name: 'Settlement', count: 26 },
      { id: 'svc-customer-login', name: 'Customer login', count: 19 },
      { id: 'svc-merchant-api', name: 'Merchant API', count: 14 },
    ],
    drillDowns: [
      { metric: 'mttr', current: 31, prior: 39, unit: 'minutes', source: 'Incident records' },
      {
        metric: 'time-to-first-hypothesis',
        current: 161,
        prior: 198,
        unit: 'seconds',
        source: 'Replay',
      },
      {
        metric: 'downtime-avoided',
        current: 318,
        prior: 241,
        unit: 'minutes',
        source: 'Customer history',
      },
      {
        metric: 'unapproved-production-changes',
        current: 0,
        prior: 0,
        unit: 'count',
        source: 'Audit log',
      },
    ],
  };
}
