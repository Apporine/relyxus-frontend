import type { IncidentListSummary } from '@/features/incidents/model';
import type { IncidentSummary } from '@/features/incidents/model';
import type { SeverityLevel } from '@relyxus/ui';

/*
 * DEVELOPMENT FIXTURE. Shared incident records for the Command Centre and Incident List
 * (Figma frames 03 and 04). Times are relative so ages stay plausible during `next dev`.
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_SECOND = 1_000;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;

import { incidentListBusinessServices } from '@/features/incidents/incident-list-services';

const businessServiceNameById = Object.fromEntries(
  incidentListBusinessServices.map((service) => [service.id, service.name]),
) as Record<string, string>;

function isoInstantFromNow(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

export type IncidentListQuery = {
  status: 'active' | 'resolved' | 'all';
  severities: readonly SeverityLevel[];
  businessServiceId: string | null;
  sort: 'severity' | 'declared-at';
};

function isActiveIncident(incident: IncidentSummary): boolean {
  return (
    incident.state !== 'resolved' && incident.state !== 'closed' && incident.state !== 'cancelled'
  );
}

/** Every incident record for the Payments / UK demo workspace. */
export function incidentRecordsFor(workspaceSlug: string): IncidentSummary[] | null {
  if (workspaceSlug !== 'payments-uk') {
    return null;
  }

  return [
    {
      reference: 'INC-2041',
      title: 'Card authorisation failures in UK',
      severity: 'SEV1',
      state: 'investigating',
      visibility: 'workspace',
      environment: 'production',
      businessServiceNames: ['Card payments'],
      ownerTeamName: 'Payments SRE',
      impact: {
        moneyAtRisk: {
          amountInMinorUnits: 18_400_000,
          currencyCode: 'GBP',
          confidence: 'estimated',
        },
        failedTransactions: 18_400,
        affectedCustomers: null,
      },
      impactStartedAt: isoInstantFromNow(-18 * MILLISECONDS_PER_MINUTE),
      declaredAt: isoInstantFromNow(-19 * MILLISECONDS_PER_MINUTE),
    },
    {
      reference: 'INC-2038',
      title: 'Settlement queue lag in eu-west-2',
      severity: 'SEV2',
      state: 'mitigating',
      visibility: 'workspace',
      environment: 'production',
      businessServiceNames: ['Settlement'],
      ownerTeamName: 'Platform',
      impact: {
        moneyAtRisk: {
          amountInMinorUnits: 4_100_000,
          currencyCode: 'GBP',
          confidence: 'estimated',
        },
        failedTransactions: 2_100,
        affectedCustomers: null,
      },
      impactStartedAt: isoInstantFromNow(-42 * MILLISECONDS_PER_MINUTE),
      declaredAt: isoInstantFromNow(-43 * MILLISECONDS_PER_MINUTE),
    },
    {
      reference: 'INC-2037',
      title: 'Identity provider elevated latency',
      severity: 'SEV3',
      state: 'monitoring',
      visibility: 'workspace',
      environment: 'production',
      businessServiceNames: ['Customer login'],
      ownerTeamName: 'Identity',
      impact: {
        moneyAtRisk: null,
        failedTransactions: null,
        affectedCustomers: 3_204,
      },
      impactStartedAt: isoInstantFromNow(-72 * MILLISECONDS_PER_MINUTE),
      declaredAt: isoInstantFromNow(-73 * MILLISECONDS_PER_MINUTE),
    },
    {
      reference: 'INC-2034',
      title: 'Merchant webhook delay',
      severity: 'SEV4',
      state: 'investigating',
      visibility: 'workspace',
      environment: 'production',
      businessServiceNames: ['Merchant API'],
      ownerTeamName: 'Integrations',
      impact: {
        moneyAtRisk: null,
        failedTransactions: null,
        affectedCustomers: null,
      },
      impactStartedAt: isoInstantFromNow(-126 * MILLISECONDS_PER_MINUTE),
      declaredAt: isoInstantFromNow(-127 * MILLISECONDS_PER_MINUTE),
    },
    {
      reference: 'INC-2031',
      title: 'Duplicate settlement postings',
      severity: 'SEV2',
      state: 'resolved',
      visibility: 'workspace',
      environment: 'production',
      businessServiceNames: ['Settlement'],
      ownerTeamName: 'Platform',
      impact: {
        moneyAtRisk: { amountInMinorUnits: 900_000, currencyCode: 'GBP', confidence: 'measured' },
        failedTransactions: 420,
        affectedCustomers: null,
      },
      impactStartedAt: isoInstantFromNow(-6 * MILLISECONDS_PER_HOUR),
      declaredAt: isoInstantFromNow(-6 * MILLISECONDS_PER_HOUR - 5 * MILLISECONDS_PER_MINUTE),
    },
    {
      reference: 'INC-2029',
      title: 'Status page stale component data',
      severity: 'SEV4',
      state: 'closed',
      visibility: 'workspace',
      environment: 'production',
      businessServiceNames: ['Card payments'],
      ownerTeamName: 'Communications',
      impact: {
        moneyAtRisk: null,
        failedTransactions: null,
        affectedCustomers: null,
      },
      impactStartedAt: isoInstantFromNow(-30 * MILLISECONDS_PER_HOUR),
      declaredAt: isoInstantFromNow(-30 * MILLISECONDS_PER_HOUR),
    },
  ];
}

const severityOrder: Record<SeverityLevel, number> = { SEV1: 0, SEV2: 1, SEV3: 2, SEV4: 3 };

/** Applies list filters the same way the API would (provisional contract, ADR 0004). */
export function filterIncidentRecords(
  incidents: IncidentSummary[],
  query: IncidentListQuery,
): IncidentSummary[] {
  let filtered = incidents.filter((incident) => {
    if (query.status === 'active') {
      return isActiveIncident(incident);
    }
    if (query.status === 'resolved') {
      return !isActiveIncident(incident);
    }
    return true;
  });

  if (query.severities.length > 0) {
    filtered = filtered.filter((incident) => query.severities.includes(incident.severity));
  }

  if (query.businessServiceId !== null) {
    const serviceName = businessServiceNameById[query.businessServiceId];
    if (serviceName !== undefined) {
      filtered = filtered.filter((incident) => incident.businessServiceNames.includes(serviceName));
    }
  }

  return [...filtered].sort((first, second) => {
    if (query.sort === 'declared-at') {
      return new Date(second.declaredAt).getTime() - new Date(first.declaredAt).getTime();
    }
    const severityDifference = severityOrder[first.severity] - severityOrder[second.severity];
    if (severityDifference !== 0) {
      return severityDifference;
    }
    return new Date(first.impactStartedAt).getTime() - new Date(second.impactStartedAt).getTime();
  });
}

/** Summary metric cards for the Incident List header (Figma frame 04). */
export function incidentListSummaryFor(workspaceSlug: string): IncidentListSummary | null {
  if (workspaceSlug !== 'payments-uk') {
    return null;
  }

  return {
    activeBySeverity: { SEV1: 1, SEV2: 2, SEV3: 1, SEV4: 1 },
    activeInvestigatingCount: 4,
    activeMonitoringCount: 3,
    resolvedLast24Hours: 7,
  };
}
