import type { RegulatorClock } from '@/features/compliance/model';
import type {
  Communications,
  IncidentDetail,
  IncidentTask,
  Investigation,
  ProposedAction,
  TimelineEntry,
} from '@/features/war-room/model';

import { commandCentreFixturesFor } from './command-centre-fixtures';
import { incidentRecordsFor } from './incident-fixtures';

/*
 * DEVELOPMENT FIXTURE. War room data for the Payments / UK demo workspace. INC-2041 follows
 * Figma frame 06; other incidents get a plausible minimal war room. INC-1999 stands for a
 * restricted incident the demo user may not open.
 */

export const RESTRICTED_DEMO_INCIDENT_REFERENCE = 'INC-1999';

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_SECOND = 1_000;
const DEMO_WORKSPACE_SLUG = 'payments-uk';
const FIGMA_INCIDENT_REFERENCE = 'INC-2041';

function isoInstantFromNow(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

export type WarRoomFixture = {
  incident: IncidentDetail;
  investigation: Investigation;
  actions: ProposedAction[];
  clocks: RegulatorClock[];
  communications: Communications;
  timeline: TimelineEntry[];
  tasks: IncidentTask[];
};

/** Acknowledgements recorded during this browser session, by incident reference. */
const recordedAcknowledgements = new Map<string, NonNullable<IncidentDetail['acknowledgement']>>();

export function recordAcknowledgement(reference: string, acknowledgedByName: string) {
  const acknowledgement = { acknowledgedByName, acknowledgedAt: new Date().toISOString() };
  if (!recordedAcknowledgements.has(reference)) {
    recordedAcknowledgements.set(reference, acknowledgement);
  }
  return recordedAcknowledgements.get(reference) ?? acknowledgement;
}

/** Clears recorded acknowledgements, so each test starts from an unacknowledged incident. */
export function forgetRecordedAcknowledgements(): void {
  recordedAcknowledgements.clear();
}

function figmaIncidentWarRoom(incident: IncidentDetail, clocks: RegulatorClock[]): WarRoomFixture {
  const startedAt = Date.parse(incident.impactStartedAt);
  const at = (minutesAfterStart: number, secondsAfterStart = 0) =>
    new Date(
      startedAt +
        minutesAfterStart * MILLISECONDS_PER_MINUTE +
        secondsAfterStart * MILLISECONDS_PER_SECOND,
    ).toISOString();

  return {
    incident: { ...incident, commanderName: 'Sara Malik' },
    investigation: {
      status: 'hypotheses-ready',
      summary: {
        text: 'Payment failures correlate with a configuration rollout on payments-api. Database and network signals do not support a wider infrastructure failure.',
        modelRoute: 'Claude Sonnet 5.5 · eu-west-2 route',
        generatedAt: at(3, 4),
        evidenceCount: 9,
      },
      hypotheses: [
        {
          id: 'hypothesis-config-regression',
          rank: 1,
          cause: 'Configuration regression in payments-api',
          confidencePercent: 82,
          status: 'under-test',
          supportingEvidenceCount: 6,
          refutingEvidenceCount: 1,
          whatWasChecked: null,
        },
        {
          id: 'hypothesis-db-pool',
          rank: 2,
          cause: 'Database connection pool saturation',
          confidencePercent: 31,
          status: 'under-test',
          supportingEvidenceCount: 2,
          refutingEvidenceCount: 3,
          whatWasChecked: 'Pool usage, database latency, lock wait and failover state.',
        },
        {
          id: 'hypothesis-card-network',
          rank: 3,
          cause: 'Card network outage',
          confidencePercent: 4,
          status: 'ruled-out',
          ruledOutReason: 'Card network status and synthetic checks were healthy throughout.',
          supportingEvidenceCount: 0,
          refutingEvidenceCount: 4,
          whatWasChecked: null,
        },
      ],
      degradedSources: [],
    },
    actions: [
      {
        id: 'action-restart-payments-api',
        title: 'Restart payments-api',
        environment: 'production',
        state: 'waiting-for-approval',
        command: 'kubectl rollout restart deployment/payments-api -n payments',
        approvalId: 'approval-restart-payments-api',
        facts: {
          target: 'payments-api / eu-west-2 / PROD · 3 pods · UK card traffic',
          rationale: 'Configuration regression in payments-api (82%) · 6 evidence links',
          policy: 'Payments PROD v18 · proposer excluded · MFA required',
          approvers: 'Sara Malik (on call) approved · payments lead waiting · 1 of 2',
          dryRun: 'Dry run passed',
          verification: '5xx below 2% for 5 minutes, else roll back to revision 184',
        },
        expiresAt: isoInstantFromNow(3 * MILLISECONDS_PER_MINUTE + 18 * MILLISECONDS_PER_SECOND),
      },
    ],
    clocks,
    communications: {
      nextStakeholderUpdateDueAt: isoInstantFromNow(
        8 * MILLISECONDS_PER_MINUTE + 12 * MILLISECONDS_PER_SECOND,
      ),
      draftsAwaitingApprovalCount: 1,
    },
    timeline: [
      {
        id: 'tl-1',
        occurredAt: at(0, 31),
        actorKind: 'external',
        actorName: 'Prometheus',
        summary: '5xx rate exceeded 22%',
        needsAttention: false,
      },
      {
        id: 'tl-2',
        occurredAt: at(1, 2),
        actorKind: 'ai',
        actorName: 'AI',
        summary: 'Investigation started',
        needsAttention: false,
      },
      {
        id: 'tl-3',
        occurredAt: at(1, 41),
        actorKind: 'system',
        actorName: 'System',
        summary: 'ServiceNow change CHG-88421 linked',
        needsAttention: false,
      },
      {
        id: 'tl-4',
        occurredAt: at(2, 10),
        actorKind: 'person',
        actorName: 'Sara Malik',
        summary: 'Commander assigned',
        needsAttention: false,
      },
      {
        id: 'tl-5',
        occurredAt: at(3, 4),
        actorKind: 'ai',
        actorName: 'AI',
        summary: 'Primary hypothesis updated',
        needsAttention: false,
      },
      {
        id: 'tl-6',
        occurredAt: at(3, 42),
        actorKind: 'system',
        actorName: 'Approval',
        summary: 'Production restart requested',
        needsAttention: true,
      },
    ],
    tasks: [
      {
        id: 'task-rollout-diff',
        title: 'Compare rollout diff',
        status: 'in-progress',
        ownerName: 'M. Khan',
        dueAt: null,
        isOverdue: false,
      },
      {
        id: 'task-rollback-package',
        title: 'Validate rollback package',
        status: 'done',
        ownerName: 'System',
        dueAt: null,
        isOverdue: false,
      },
      {
        id: 'task-uk-traffic',
        title: 'Confirm UK traffic concentration',
        status: 'blocked',
        ownerName: 'A. Rahman',
        dueAt: null,
        isOverdue: false,
      },
      {
        id: 'task-card-network',
        title: 'Call card network',
        status: 'open',
        ownerName: null,
        dueAt: at(12),
        isOverdue: true,
      },
    ],
  };
}

function minimalWarRoom(incident: IncidentDetail): WarRoomFixture {
  return {
    incident,
    investigation: { status: 'investigating', summary: null, hypotheses: [], degradedSources: [] },
    actions: [],
    clocks: [],
    communications: { nextStakeholderUpdateDueAt: null, draftsAwaitingApprovalCount: 0 },
    timeline: [
      {
        id: `${incident.reference}-declared`,
        occurredAt: incident.declaredAt,
        actorKind: 'person',
        actorName: 'Sara Malik',
        summary: 'Incident declared',
        needsAttention: false,
      },
    ],
    tasks: [],
  };
}

/** The war room for one incident, or null when it does not exist for this workspace. */
export function warRoomFixtureFor(workspaceSlug: string, reference: string): WarRoomFixture | null {
  const incidentSummary = incidentRecordsFor(workspaceSlug)?.find(
    (incident) => incident.reference === reference,
  );
  if (workspaceSlug !== DEMO_WORKSPACE_SLUG || incidentSummary === undefined) {
    return null;
  }
  const incident: IncidentDetail = {
    ...incidentSummary,
    commanderName: null,
    acknowledgement: recordedAcknowledgements.get(reference) ?? null,
  };
  if (reference !== FIGMA_INCIDENT_REFERENCE) {
    return minimalWarRoom(incident);
  }
  const clocks =
    commandCentreFixturesFor(workspaceSlug)?.regulatorClocks.filter(
      (clock) => clock.incidentReference === reference,
    ) ?? [];
  return figmaIncidentWarRoom(incident, clocks);
}
