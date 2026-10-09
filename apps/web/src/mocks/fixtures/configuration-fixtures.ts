import type { IncidentTypeDetail } from '@/features/incident-types/model';
import type { PolicyDetail } from '@/features/policies/model';
import type { RunbookDetail } from '@/features/runbooks/model';

/*
 * DEVELOPMENT FIXTURE. Policies (Figma frame 11), runbooks (frame 14) and incident types
 * (frame 27) for the Payments / UK demo workspace.
 */

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;
const daysAgo = (days: number) => new Date(Date.now() - days * MILLISECONDS_PER_DAY).toISOString();

const simulation = { allowed: 27, needingApproval: 4, denied: 0 };

export const policyFixtures: PolicyDetail[] = [
  {
    id: 'policy-payments-restart',
    name: 'Payments restart',
    autonomy: 'l1',
    state: 'published',
    action: 'Restart deployment',
    scope: 'Business service = Card payments',
    environment: 'production',
    approvers: 'Service owner and on-call lead',
    freezeCalendar: 'Month-end close',
    effective: {
      result: 'l1',
      inheritedDeny: null,
      isRollbackRequired: true,
      isVerificationRequired: true,
      simulation,
    },
  },
  {
    id: 'policy-settlement-scale',
    name: 'Settlement scale',
    autonomy: 'l2',
    state: 'published',
    action: 'Scale deployment',
    scope: 'Service = settlement-worker',
    environment: 'production',
    approvers: 'On-call lead',
    freezeCalendar: null,
    effective: {
      result: 'l2',
      inheritedDeny: null,
      isRollbackRequired: true,
      isVerificationRequired: true,
      simulation: { allowed: 12, needingApproval: 9, denied: 1 },
    },
  },
  {
    id: 'policy-card-failover',
    name: 'Fail over card routing',
    autonomy: 'l1',
    state: 'draft',
    action: 'Fail over load balancer',
    scope: 'Service = card-router',
    environment: 'production',
    approvers: 'Two approvers from Payments platform',
    freezeCalendar: 'Month-end close',
    effective: {
      result: 'deny',
      inheritedDeny: 'Emergency freeze',
      isRollbackRequired: true,
      isVerificationRequired: true,
      simulation: { allowed: 0, needingApproval: 0, denied: 6 },
    },
  },
  {
    id: 'policy-emergency-freeze',
    name: 'Emergency freeze',
    autonomy: 'deny',
    state: 'active',
    action: 'Any production change',
    scope: 'Workspace = Payments / UK',
    environment: 'production',
    approvers: 'Head of SRE',
    freezeCalendar: 'Until lifted',
    effective: {
      result: 'deny',
      inheritedDeny: null,
      isRollbackRequired: false,
      isVerificationRequired: false,
      simulation: { allowed: 0, needingApproval: 0, denied: 31 },
    },
  },
];

export function runbookFixtures(): RunbookDetail[] {
  return [
    {
      id: 'runbook-payments-rollback',
      name: 'Payments rollback',
      source: 'git',
      version: 12,
      lastTestedAt: daysAgo(3),
      isReviewDue: false,
      steps: [
        { number: 1, kind: 'read', description: 'Confirm the current revision' },
        { number: 2, kind: 'read', description: 'Check the error budget' },
        { number: 3, kind: 'gate', description: 'Request production approval' },
        { number: 4, kind: 'action', description: 'Roll back the deployment' },
        { number: 5, kind: 'verify', description: '5xx below 2% for 5 minutes' },
        { number: 6, kind: 'manual', description: 'Commander confirms recovery' },
      ],
      latestRun: {
        incidentReference: 'INC-1998',
        result: 'succeeded',
        version: 12,
        isVersionPinned: true,
        recovery: 'No partial failure',
      },
    },
    {
      id: 'runbook-settlement-recovery',
      name: 'Settlement recovery',
      source: 'git',
      version: 7,
      lastTestedAt: daysAgo(9),
      isReviewDue: false,
      steps: [
        { number: 1, kind: 'read', description: 'Check the settlement queue depth' },
        { number: 2, kind: 'gate', description: 'Request approval to drain the queue' },
        { number: 3, kind: 'action', description: 'Restart settlement-worker' },
        { number: 4, kind: 'verify', description: 'Queue depth falling for 10 minutes' },
      ],
      latestRun: null,
    },
    {
      id: 'runbook-redis-failover',
      name: 'Redis failover',
      source: 'manual',
      version: 3,
      lastTestedAt: null,
      isReviewDue: true,
      steps: [
        { number: 1, kind: 'read', description: 'Confirm replica lag' },
        { number: 2, kind: 'manual', description: 'Promote the replica by hand' },
      ],
      latestRun: null,
    },
    {
      id: 'runbook-identity-degraded',
      name: 'Identity degraded mode',
      source: 'git',
      version: 19,
      lastTestedAt: daysAgo(1),
      isReviewDue: false,
      steps: [
        { number: 1, kind: 'read', description: 'Check identity provider latency' },
        { number: 2, kind: 'gate', description: 'Request approval for degraded mode' },
        { number: 3, kind: 'action', description: 'Enable cached session validation' },
        { number: 4, kind: 'verify', description: 'Sign-in success above 99%' },
      ],
      latestRun: {
        incidentReference: 'INC-2037',
        result: 'partially-failed',
        version: 18,
        isVersionPinned: true,
        recovery: 'Step 3 was rolled back automatically',
      },
    },
  ];
}

export const incidentTypeFixtures: IncidentTypeDetail[] = [
  {
    id: 'type-production-outage',
    name: 'Production outage',
    version: 8,
    state: 'published',
    declarationFields: ['Title', 'Services', 'Severity', 'Impact'],
    requiredFields: ['Title', 'Severity', 'Impact started'],
    conditionalFields: [{ field: 'Customer region', condition: 'SEV1' }],
    defaultVisibility: 'workspace',
    lifecycle: ['triage', 'investigating', 'mitigating', 'monitoring', 'resolved'],
    automations: ['Notification', 'Classification'],
    regulatorMappings: ['DORA ICT v4'],
  },
  {
    id: 'type-security-event',
    name: 'Security event',
    version: 5,
    state: 'published',
    declarationFields: ['Title', 'Detection source', 'Severity'],
    requiredFields: ['Title', 'Severity'],
    conditionalFields: [],
    defaultVisibility: 'restricted-group',
    lifecycle: ['triage', 'investigating', 'mitigating', 'resolved'],
    automations: ['Security team paged'],
    regulatorMappings: ['DORA ICT v4', 'UK GDPR breach'],
  },
  {
    id: 'type-data-integrity',
    name: 'Data integrity',
    version: 3,
    state: 'published',
    declarationFields: ['Title', 'Affected records', 'Severity'],
    requiredFields: ['Title', 'Affected records'],
    conditionalFields: [],
    defaultVisibility: 'workspace',
    lifecycle: ['triage', 'investigating', 'resolved'],
    automations: [],
    regulatorMappings: [],
  },
  {
    id: 'type-supplier-outage',
    name: 'Supplier outage',
    version: 2,
    state: 'draft',
    declarationFields: ['Title', 'Supplier', 'Severity'],
    requiredFields: ['Title', 'Supplier'],
    conditionalFields: [{ field: 'Contract reference', condition: 'Critical supplier' }],
    defaultVisibility: 'workspace',
    lifecycle: ['triage', 'monitoring', 'resolved'],
    automations: ['Vendor status check'],
    regulatorMappings: ['DORA third-party v2'],
  },
];
