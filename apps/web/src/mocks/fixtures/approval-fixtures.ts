import type {
  ApprovalDecisionRequest,
  ApprovalDecisionResponse,
  ApprovalDetail,
  PendingApproval,
} from '@/features/approvals/model';

/*
 * DEVELOPMENT FIXTURE. Sample approval requests for the Payments / UK demo workspace, based on
 * Figma frame 10 and the INC-2041 war room. Expiry instants are fixed when first requested, so
 * countdowns stay steady across refetches, and recorded decisions change later answers the way
 * the server would.
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_SECOND = 1_000;
const DEMO_WORKSPACE_SLUG = 'payments-uk';

/** An approval on a restricted incident: its detail answers 403, as for any other outsider. */
export const RESTRICTED_DEMO_APPROVAL_ID = 'approval-restricted-incident';

type ApprovalFixture = ApprovalDetail & {
  /** Whose decision the request waits on, from the signed-in person's point of view. */
  assignee: 'me' | 'others';
};

let approvalFixtures: ApprovalFixture[] | null = null;

function isoInstantFromNow(offsetMs: number): string {
  return new Date(Date.now() + offsetMs).toISOString();
}

const incidentInc2041 = {
  reference: 'INC-2041',
  title: 'Card authorisation failures in UK',
  severity: 'SEV1',
  visibility: 'workspace',
} as const;

function createApprovalFixtures(): ApprovalFixture[] {
  return [
    {
      assignee: 'me',
      id: 'approval-restart-payments-api',
      kind: 'production-action',
      title: 'Restart payments-api',
      incidentReference: incidentInc2041.reference,
      incident: incidentInc2041,
      target: 'payments-api / PROD',
      environment: 'production',
      blastRadius: '3 pods · UK cards',
      quorum: { approved: 1, required: 2 },
      expiresAt: isoInstantFromNow(3 * MILLISECONDS_PER_MINUTE + 18 * MILLISECONDS_PER_SECOND),
      requestedByName: 'Daniel Okafor',
      command: {
        text: 'kubectl rollout restart deployment/payments-api -n payments',
        cluster: 'prod-eu-west-2',
        namespace: 'payments',
      },
      expectedResult: 'Pods restart one at a time; card authorisation recovers within 3 minutes.',
      evidence: [
        {
          id: 'evidence-config-rollout',
          summary: 'Configuration rollout 14:02',
          detail: 'payments-api revision 185 changed the connection timeout',
          signal: 'change',
        },
        {
          id: 'evidence-error-rate',
          summary: '5xx rate 18%',
          detail: 'Card authorisation errors since 14:03',
          signal: 'degradation',
        },
        {
          id: 'evidence-canary',
          summary: 'Canary pod recovered',
          detail: 'One restarted pod has served cleanly for 4 minutes',
          signal: 'verification',
        },
      ],
      effectivePolicy: {
        name: 'Payments PROD v18',
        constraints: ['Two approvers', 'Proposer excluded', 'MFA re-confirmation'],
        conflicts: [],
      },
      consequences: {
        risk: 'Brief capacity drop while pods restart; no data loss.',
        rollback: 'Roll back to revision 184 automatically if verification fails.',
        verification: '5xx below 2% for 5 minutes.',
      },
      mfaRequired: true,
      decisionBlockReason: null,
    },
    {
      assignee: 'me',
      id: 'approval-scale-settlement-staging',
      kind: 'production-action',
      title: 'Scale settlement-worker',
      incidentReference: null,
      incident: null,
      target: 'settlement-worker / STAGING',
      environment: 'staging',
      blastRadius: 'Staging settlement queue only',
      quorum: { approved: 0, required: 1 },
      expiresAt: isoInstantFromNow(12 * MILLISECONDS_PER_MINUTE),
      requestedByName: 'Leila Haddad',
      command: {
        text: 'kubectl scale deployment/settlement-worker --replicas=6 -n settlement',
        cluster: 'staging-eu-west-2',
        namespace: 'settlement',
      },
      expectedResult: 'Six workers drain the staging settlement backlog before the load test.',
      evidence: [
        {
          id: 'evidence-queue-depth',
          summary: 'Queue depth 42,000',
          detail: 'Staging settlement backlog since the 09:00 replay',
          signal: 'degradation',
        },
      ],
      effectivePolicy: {
        name: 'Settlement STAGING v4',
        constraints: ['One approver'],
        conflicts: [],
      },
      consequences: {
        risk: 'Higher staging database load during the scale-up.',
        rollback: 'Scale back to 2 replicas.',
        verification: 'Queue depth below 1,000 within 20 minutes.',
      },
      mfaRequired: false,
      decisionBlockReason: null,
    },
    {
      assignee: 'me',
      id: 'approval-dora-initial-notice',
      kind: 'report',
      title: 'DORA initial notice for INC-2041',
      incidentReference: incidentInc2041.reference,
      incident: incidentInc2041,
      target: 'Central Bank submission',
      environment: 'production',
      blastRadius: 'Regulator filing',
      quorum: { approved: 0, required: 1 },
      expiresAt: isoInstantFromNow(40 * MILLISECONDS_PER_MINUTE),
      requestedByName: 'A. Rahman',
      command: null,
      expectedResult: null,
      evidence: [],
      effectivePolicy: {
        name: 'EU DORA v1.2',
        constraints: ['Compliance owner approves'],
        conflicts: [],
      },
      consequences: { risk: null, rollback: null, verification: null },
      mfaRequired: false,
      decisionBlockReason: null,
    },
    {
      assignee: 'others',
      id: 'approval-rollback-ledger-config',
      kind: 'production-action',
      title: 'Roll back ledger-config',
      incidentReference: null,
      incident: null,
      target: 'ledger-config / PROD',
      environment: 'production',
      blastRadius: 'Ledger reconciliation · all regions',
      quorum: { approved: 1, required: 2 },
      expiresAt: isoInstantFromNow(25 * MILLISECONDS_PER_MINUTE),
      requestedByName: 'Omar Siddiqui',
      command: {
        text: 'relyxus config rollback ledger-config --to v52',
        cluster: null,
        namespace: null,
      },
      expectedResult: 'Reconciliation jobs use the v52 thresholds again.',
      evidence: [],
      effectivePolicy: {
        name: 'Ledger PROD v7',
        constraints: ['Finance controller approves'],
        conflicts: [],
      },
      consequences: {
        risk: 'Reconciliation reruns for the last hour.',
        rollback: 'Reapply v53.',
        verification: 'No reconciliation breaks for 30 minutes.',
      },
      mfaRequired: true,
      decisionBlockReason: 'waiting-for-others',
    },
  ];
}

function fixturesFor(workspaceSlug: string): ApprovalFixture[] {
  if (workspaceSlug !== DEMO_WORKSPACE_SLUG) {
    return [];
  }
  approvalFixtures ??= createApprovalFixtures();
  return approvalFixtures;
}

function summaryOf({
  id,
  kind,
  title,
  incidentReference,
  target,
  environment,
  blastRadius,
  quorum,
  expiresAt,
}: ApprovalFixture): PendingApproval {
  return {
    id,
    kind,
    title,
    incidentReference,
    target,
    environment,
    blastRadius,
    quorum,
    expiresAt,
  };
}

/** Pending requests waiting on the given approvers, soonest expiry first; decided ones leave. */
export function pendingApprovalsFor(
  workspaceSlug: string,
  assignee: 'me' | 'others',
): PendingApproval[] {
  return fixturesFor(workspaceSlug)
    .filter(
      (approval) =>
        approval.assignee === assignee &&
        approval.decisionBlockReason !== 'already-decided' &&
        Date.parse(approval.expiresAt) > Date.now(),
    )
    .sort((first, second) => Date.parse(first.expiresAt) - Date.parse(second.expiresAt))
    .map(summaryOf);
}

export function approvalDetailFor(
  workspaceSlug: string,
  approvalId: string,
): ApprovalDetail | null {
  const approval = fixturesFor(workspaceSlug).find((candidate) => candidate.id === approvalId);
  if (approval === undefined) {
    return null;
  }
  const { assignee: _assignee, ...detail } = approval;
  const hasExpired = Date.parse(detail.expiresAt) <= Date.now();
  return hasExpired && detail.decisionBlockReason === null
    ? { ...detail, decisionBlockReason: 'expired' }
    : detail;
}

export type RecordedDecision =
  { status: 'recorded'; response: ApprovalDecisionResponse } | { status: 'refused'; title: string };

/**
 * Applies a decision with the server's rules: blocked, expired or MFA-protected approvals are
 * refused; anything else is recorded once and leaves the signed-in person's queue.
 */
export function recordApprovalDecision(
  workspaceSlug: string,
  approvalId: string,
  decision: ApprovalDecisionRequest,
): RecordedDecision | null {
  const approval = fixturesFor(workspaceSlug).find((candidate) => candidate.id === approvalId);
  const detail = approvalDetailFor(workspaceSlug, approvalId);
  if (approval === undefined || detail === null) {
    return null;
  }
  if (detail.decisionBlockReason !== null) {
    return { status: 'refused', title: `Decision not allowed: ${detail.decisionBlockReason}` };
  }
  if (decision.decision === 'approve' && approval.mfaRequired) {
    return { status: 'refused', title: 'Multi-factor re-confirmation required' };
  }

  approval.decisionBlockReason = 'already-decided';
  if (decision.decision === 'reject') {
    return { status: 'recorded', response: { outcome: 'rejected', quorum: approval.quorum } };
  }
  approval.quorum = { ...approval.quorum, approved: approval.quorum.approved + 1 };
  return {
    status: 'recorded',
    response: {
      outcome:
        approval.quorum.approved >= approval.quorum.required ? 'approved' : 'approval-recorded',
      quorum: approval.quorum,
    },
  };
}

/** Restores the original requests, so each test starts from the same queue. */
export function forgetRecordedApprovalDecisions(): void {
  approvalFixtures = null;
}
