import type { LastDaySummary } from '@/features/analytics/model';
import type { RegulatorClock } from '@/features/compliance/model';
import type { IncidentSummary } from '@/features/incidents/model';
import { filterIncidentRecords, incidentRecordsFor } from '@/mocks/fixtures/incident-fixtures';
import type { ConnectorSummary } from '@/features/integrations/model';
import type { BusinessServiceAtRisk } from '@/features/services/model';

/*
 * DEVELOPMENT FIXTURE. Sample Command Centre data from Figma frame 03 (INC-2041). Times are
 * computed when each handler runs so countdowns and ages stay plausible during `next dev`.
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_SECOND = 1_000;

function isoInstantFromNow(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

function emptyListResponse() {
  return { items: [] as never[], nextCursor: null };
}

/** Returns Command Centre fixtures for the Payments / UK demo workspace. */
export function commandCentreFixturesFor(workspaceSlug: string): {
  activeIncidents: IncidentSummary[];
  regulatorClocks: RegulatorClock[];
  businessServicesAtRisk: BusinessServiceAtRisk[];
  connectors: ConnectorSummary[];
  lastDaySummary: LastDaySummary;
} | null {
  if (workspaceSlug !== 'payments-uk') {
    return null;
  }

  const regulatorDeadlineAt = isoInstantFromNow(
    3 * 60 * 60 * MILLISECONDS_PER_SECOND +
      41 * MILLISECONDS_PER_MINUTE +
      22 * MILLISECONDS_PER_SECOND,
  );
  // DORA initial notice: four hours from classification (Product s. 12).
  const regulatorStartedAt = new Date(
    Date.parse(regulatorDeadlineAt) - 4 * 60 * MILLISECONDS_PER_MINUTE,
  ).toISOString();

  const allIncidents = incidentRecordsFor(workspaceSlug);
  if (allIncidents === null) {
    return null;
  }

  return {
    activeIncidents: filterIncidentRecords(allIncidents, {
      status: 'active',
      severities: [],
      businessServiceId: null,
      sort: 'severity',
    }),
    regulatorClocks: [
      {
        id: 'clock-dora-initial-notice',
        obligationName: 'DORA initial notice',
        incidentReference: 'INC-2041',
        rulePackage: 'EU DORA v1.2',
        ownerName: 'A. Rahman',
        startedAt: regulatorStartedAt,
        deadlineAt: regulatorDeadlineAt,
        isSubmitted: false,
      },
    ],
    businessServicesAtRisk: [
      { id: 'svc-card-auth', name: 'Card authorisation', health: 'at-risk' },
      { id: 'svc-settlement', name: 'Settlement', health: 'degraded' },
      { id: 'svc-customer-login', name: 'Customer login', health: 'monitoring' },
    ],
    connectors: [
      { id: 'conn-prometheus', name: 'Prometheus', health: 'connected' },
      { id: 'conn-grafana', name: 'Grafana', health: 'connected' },
      { id: 'conn-servicenow', name: 'ServiceNow', health: 'degraded' },
      { id: 'conn-datadog', name: 'Datadog', health: 'connected' },
      { id: 'conn-pagerduty', name: 'PagerDuty', health: 'connected' },
      { id: 'conn-jira', name: 'Jira', health: 'connected' },
      { id: 'conn-slack', name: 'Slack', health: 'connected' },
      { id: 'conn-github', name: 'GitHub', health: 'connected' },
      { id: 'conn-aws', name: 'AWS CloudWatch', health: 'connected' },
      { id: 'conn-azure', name: 'Azure Monitor', health: 'connected' },
      { id: 'conn-splunk', name: 'Splunk', health: 'connected' },
      { id: 'conn-teams', name: 'Microsoft Teams', health: 'connected' },
      { id: 'conn-statuspage', name: 'Statuspage', health: 'connected' },
    ],
    lastDaySummary: {
      incidentCount: 11,
      medianTimeToFirstHypothesisSeconds: 161 * 60 + 41,
      resolvedWithoutRollbackCount: 7,
      unapprovedProductionChangeCount: 0,
    },
  };
}

export { emptyListResponse };
