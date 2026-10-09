import type {
  PlatformOperations,
  PromotionDetail,
  SecuritySectionDetail,
  StatusPageDetail,
  SupportSessionDetail,
  UserDetail,
} from '@/features/admin/model';

/*
 * DEVELOPMENT FIXTURE. Status pages (Figma frame 21) and administration screens (frames 29
 * to 33) for the Payments / UK demo workspace.
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_HOUR = 60 * MILLISECONDS_PER_MINUTE;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;
const minutesFromNow = (minutes: number) =>
  new Date(Date.now() + minutes * MILLISECONDS_PER_MINUTE).toISOString();
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * MILLISECONDS_PER_HOUR).toISOString();
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * MILLISECONDS_PER_DAY).toISOString();

export function statusPageFixtures(): StatusPageDetail[] {
  return [
    {
      id: 'status-public',
      name: 'Public status',
      audience: 'public',
      activeIncidentCount: 1,
      state: 'degraded',
      subscriberCount: 12_480,
      isSyncReady: true,
      draftUpdate: {
        title: 'Card payments degraded',
        message: 'We are seeing failed card payments for some UK customers.',
        nextUpdateAt: minutesFromNow(30),
        components: ['Card payments', 'Merchant cards'],
        isApprovalRequired: true,
      },
    },
    {
      id: 'status-partner',
      name: 'Partner banking',
      audience: 'sign-in',
      activeIncidentCount: 1,
      state: 'degraded',
      subscriberCount: 214,
      isSyncReady: true,
      draftUpdate: null,
    },
    {
      id: 'status-internal',
      name: 'Internal operations',
      audience: 'employees',
      activeIncidentCount: 2,
      state: 'operational',
      subscriberCount: 1_830,
      isSyncReady: false,
      draftUpdate: null,
    },
  ];
}

export const promotionFixtures: PromotionDetail[] = [
  {
    id: 'promotion-payments-staging-to-production',
    sourceName: 'Payments staging',
    targetName: 'Payments production',
    counts: { added: 4, changed: 11, deleted: 2, secretsOmitted: 6 },
    differences: [
      { area: 'Policies', summary: 'Payments restart v19', kind: 'changed' },
      { area: 'Integrations', summary: 'ServiceNow mapping', kind: 'changed' },
      { area: 'Notifications', summary: 'SEV1 SMS', kind: 'added' },
      { area: 'Users', summary: 'Inactive approver role', kind: 'deleted' },
      { area: 'Retention', summary: '90 days to 120 days', kind: 'changed' },
    ],
    managedByCodeCount: 3,
    validation: {
      isSchemaValid: true,
      missingDependencyCount: 0,
      destructiveChangeCount: 2,
      isApprovalRequired: true,
    },
  },
];

export function platformOperationsFixture(): PlatformOperations {
  return {
    version: '2.8.1',
    isCurrentVersion: true,
    nodeCount: 6,
    clusterStatus: 'healthy',
    capacityPercent: 61,
    projectedCapacityPercent: 71,
    lastVerifiedBackupAt: hoursAgo(3),
    certificateExpiresAt: daysFromNow(18.5),
    checks: [
      { id: 'database', name: 'Database quorum', status: 'healthy', detail: '3 of 3' },
      { id: 'storage', name: 'Object storage', status: 'healthy', detail: '12 ms' },
      { id: 'event-bus', name: 'Event bus', status: 'healthy', detail: '0 backlog' },
      { id: 'model-route', name: 'Model route', status: 'healthy', detail: 'UK primary' },
      { id: 'backup', name: 'Backup verification', status: 'healthy', detail: '03:01 UTC' },
      { id: 'certificate', name: 'TLS certificate', status: 'warning', detail: '18 days left' },
    ],
    availableUpdate: {
      version: '2.9.0',
      isPreflightRequired: true,
      estimatedMinutes: 18,
      isRollbackSupported: true,
    },
  };
}

export function supportSessionFixtures(): SupportSessionDetail[] {
  return [
    {
      id: 'session-8821',
      reference: 'SUP-8821',
      state: 'active',
      expiresAt: minutesFromNow(41),
      reason: 'Database migration diagnostics',
      scope: 'Platform diagnostics only',
      dataClasses: 'No incident content',
      approvals: 'Two administrators',
      observerName: 'Customer administrator',
      denialReason: null,
      isActionLogStreaming: true,
      isSessionReportEnabled: true,
    },
    {
      id: 'session-8819',
      reference: 'SUP-8819',
      state: 'closed',
      expiresAt: null,
      reason: 'Connector timeout investigation',
      scope: 'ServiceNow connector logs',
      dataClasses: 'Connector metadata only',
      approvals: 'One administrator',
      observerName: null,
      denialReason: null,
      isActionLogStreaming: false,
      isSessionReportEnabled: true,
    },
    {
      id: 'session-8812',
      reference: 'SUP-8812',
      state: 'denied',
      expiresAt: null,
      reason: 'Performance review',
      scope: 'Full workspace read access',
      dataClasses: 'Incident content requested',
      approvals: 'Refused by an administrator',
      observerName: null,
      denialReason: 'Scope too broad: incident content is never shared with support',
      isActionLogStreaming: false,
      isSessionReportEnabled: false,
    },
  ];
}

export const userFixtures: UserDetail[] = [
  {
    id: 'user-sara-malik',
    name: 'Sara Malik',
    status: 'active',
    primaryTeamName: 'Payments',
    identitySource: 'Microsoft Entra ID',
    teams: ['Payments'],
    roles: ['Incident commander'],
    lastSignInAt: hoursAgo(1),
    activeSessionCount: 2,
    isDirectoryManaged: true,
    delegatedApprovalsTo: null,
    accessReview: 'current',
    hasBreakGlassAccess: false,
  },
  {
    id: 'user-a-rahman',
    name: 'A. Rahman',
    status: 'active',
    primaryTeamName: 'Payments',
    identitySource: 'Microsoft Entra ID',
    teams: ['Payments', 'On-call leads'],
    roles: ['Service owner', 'Approver'],
    lastSignInAt: hoursAgo(4),
    activeSessionCount: 1,
    isDirectoryManaged: true,
    delegatedApprovalsTo: 'M. Khan until Friday',
    accessReview: 'due',
    hasBreakGlassAccess: false,
  },
  {
    id: 'user-n-ali',
    name: 'N. Ali',
    status: 'active',
    primaryTeamName: 'Compliance',
    identitySource: 'Microsoft Entra ID',
    teams: ['Compliance'],
    roles: ['Compliance officer'],
    lastSignInAt: hoursAgo(26),
    activeSessionCount: 0,
    isDirectoryManaged: true,
    delegatedApprovalsTo: null,
    accessReview: 'current',
    hasBreakGlassAccess: false,
  },
  {
    id: 'user-m-khan',
    name: 'M. Khan',
    status: 'active',
    primaryTeamName: 'Platform',
    identitySource: 'Microsoft Entra ID',
    teams: ['Platform'],
    roles: ['Responder'],
    lastSignInAt: hoursAgo(2),
    activeSessionCount: 1,
    isDirectoryManaged: true,
    delegatedApprovalsTo: null,
    accessReview: 'current',
    hasBreakGlassAccess: true,
  },
  {
    id: 'user-t-evans',
    name: 'T. Evans',
    status: 'suspended',
    primaryTeamName: 'Security',
    identitySource: 'Local account',
    teams: ['Security'],
    roles: [],
    lastSignInAt: null,
    activeSessionCount: 0,
    isDirectoryManaged: false,
    delegatedApprovalsTo: null,
    accessReview: 'overdue',
    hasBreakGlassAccess: false,
  },
];

const ukDataFlow: SecuritySectionDetail['dataFlow'] = [
  { key: 'boundary', value: 'Customer UK cloud' },
  { key: 'vendor-egress', value: 'None' },
  { key: 'restricted-incidents', value: 'Named users only' },
  { key: 'support-visibility', value: 'Explicit grant' },
];

export const securitySectionFixtures: SecuritySectionDetail[] = [
  {
    id: 'sso-mfa',
    summary: 'Configured',
    settings: [
      { key: 'identity-provider', value: 'Microsoft Entra ID (OIDC)' },
      { key: 'mfa', value: 'Required for every user; re-confirmed for production approvals' },
    ],
    dataFlow: ukDataFlow,
  },
  {
    id: 'encryption',
    summary: 'Customer managed',
    settings: [
      { key: 'key-management', value: 'Customer-managed keys in UK HSM' },
      { key: 'key-rotation', value: 'Every 90 days' },
    ],
    dataFlow: ukDataFlow,
  },
  {
    id: 'data-policy',
    summary: 'UK only',
    settings: [
      { key: 'retention', value: 'Incidents 7 years; raw telemetry 30 days' },
      { key: 'redaction', value: 'Card numbers, emails, national IDs and tokens' },
    ],
    dataFlow: ukDataFlow,
  },
  {
    id: 'models-regions',
    summary: 'UK endpoint',
    settings: [
      { key: 'primary-model-route', value: 'Customer-managed UK endpoint' },
      { key: 'fallback-route', value: 'Dedicated UK tenant' },
      { key: 'data-residency', value: 'United Kingdom only' },
      { key: 'external-model-egress', value: 'Disabled' },
      { key: 'input-retention', value: '0 days' },
      { key: 'training-use', value: 'Prohibited' },
    ],
    dataFlow: ukDataFlow,
  },
  {
    id: 'support-access',
    summary: 'Approval required',
    settings: [
      { key: 'support-approval', value: 'Two administrators' },
      { key: 'support-duration', value: 'Up to 2 hours per session' },
    ],
    dataFlow: ukDataFlow,
  },
  {
    id: 'audit-siem',
    summary: 'Streaming',
    settings: [
      { key: 'siem-destination', value: 'Splunk Cloud UK' },
      { key: 'siem-delivery', value: 'Streaming, under 5 seconds' },
    ],
    dataFlow: ukDataFlow,
  },
];
