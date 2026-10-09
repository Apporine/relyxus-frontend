import type {
  RegulatorReport,
  RulePackageDetail,
} from '@/features/compliance/report-and-rules-model';
import type {
  ApprovalRouteDetail,
  NotificationRuleDetail,
} from '@/features/policies/routing-and-notification-model';
import type { PostIncidentReview } from '@/features/post-incident-review/model';

/*
 * DEVELOPMENT FIXTURE. Approval routing (Figma frame 12), notification rules (13), the
 * regulator report editor (17), the rule library (18) and a post-incident review (19) for
 * the Payments / UK demo workspace.
 */

const MILLISECONDS_PER_MINUTE = 60_000;
const MILLISECONDS_PER_DAY = 24 * 60 * MILLISECONDS_PER_MINUTE;
const minutesFromNow = (minutes: number) =>
  new Date(Date.now() + minutes * MILLISECONDS_PER_MINUTE).toISOString();
const daysFromNow = (days: number) =>
  new Date(Date.now() + days * MILLISECONDS_PER_DAY).toISOString();

export const approvalRouteFixtures: ApprovalRouteDetail[] = [
  {
    id: 'route-payments-production',
    name: 'Payments production',
    mode: 'staged',
    stageCount: 2,
    quorum: 2,
    stages: [
      { number: 1, resolver: 'Service owner', quorum: 1 },
      { number: 2, resolver: 'Payments primary on-call', quorum: 1 },
    ],
    isProposerExcluded: true,
    fallbackAfterMinutes: 8,
    isDelegationAllowed: true,
    mfaRequirement: 'production',
    preview: {
      stages: [
        { number: 1, approvers: [{ name: 'Sara Malik', reason: 'service owner' }] },
        { number: 2, approvers: [{ name: 'A. Rahman', reason: 'on call' }] },
      ],
      areAllApproversEligible: true,
    },
  },
  {
    id: 'route-security-changes',
    name: 'Security changes',
    mode: 'sequential',
    stageCount: 3,
    quorum: 3,
    stages: [
      { number: 1, resolver: 'Security engineering', quorum: 1 },
      { number: 2, resolver: 'Platform lead', quorum: 1 },
      { number: 3, resolver: 'Chief information security officer', quorum: 1 },
    ],
    isProposerExcluded: true,
    fallbackAfterMinutes: null,
    isDelegationAllowed: false,
    mfaRequirement: 'always',
    preview: {
      stages: [
        { number: 1, approvers: [{ name: 'M. Khan', reason: 'security engineering' }] },
        { number: 2, approvers: [{ name: 'Daniel Okafor', reason: 'platform lead' }] },
        { number: 3, approvers: [{ name: 'Priya Nair', reason: 'CISO' }] },
      ],
      areAllApproversEligible: false,
    },
  },
  {
    id: 'route-compliance-reports',
    name: 'Compliance reports',
    mode: 'parallel',
    stageCount: 1,
    quorum: 1,
    stages: [{ number: 1, resolver: 'Compliance officers', quorum: 1 }],
    isProposerExcluded: true,
    fallbackAfterMinutes: 30,
    isDelegationAllowed: true,
    mfaRequirement: 'never',
    preview: {
      stages: [
        {
          number: 1,
          approvers: [
            { name: 'N. Ali', reason: 'compliance officer' },
            { name: 'S. Evans', reason: 'compliance officer' },
          ],
        },
      ],
      areAllApproversEligible: true,
    },
  },
];

export const notificationRuleFixtures: NotificationRuleDetail[] = [
  {
    id: 'rule-sev1-customer-impact',
    name: 'SEV1 customer impact',
    isEnabled: true,
    channels: ['Teams', 'SMS'],
    trigger: 'Incident declared',
    conditions: 'Severity = SEV1 and customer impact > 0',
    recipients: ['Commander', 'Service owner', 'On-call'],
    renotifyEveryMinutes: 10,
    escalation: { target: 'Head of SRE', afterMinutes: 15 },
    deliveryPreview: [
      { recipientName: 'Sara Malik', channels: ['Teams', 'Push'], afterMinutes: null },
      { recipientName: 'A. Rahman', channels: ['Teams', 'SMS'], afterMinutes: null },
      { recipientName: 'Head of SRE', channels: ['Teams', 'SMS'], afterMinutes: 15 },
    ],
    isRestrictedSafe: true,
  },
  {
    id: 'rule-approval-expiring',
    name: 'Approval expiring',
    isEnabled: true,
    channels: ['Push', 'Email'],
    trigger: 'Approval has 2 minutes left',
    conditions: 'Approval waiting for the recipient',
    recipients: ['Eligible approvers'],
    renotifyEveryMinutes: null,
    escalation: null,
    deliveryPreview: [
      { recipientName: 'Sara Malik', channels: ['Push', 'Email'], afterMinutes: null },
    ],
    isRestrictedSafe: true,
  },
  {
    id: 'rule-regulator-clock',
    name: 'Regulator clock 75%',
    isEnabled: true,
    channels: ['Teams'],
    trigger: 'Regulator clock passes 75%',
    conditions: 'Report not submitted',
    recipients: ['Compliance owner'],
    renotifyEveryMinutes: 30,
    escalation: { target: 'Chief compliance officer', afterMinutes: 60 },
    deliveryPreview: [
      { recipientName: 'A. Rahman', channels: ['Teams'], afterMinutes: null },
      { recipientName: 'Chief compliance officer', channels: ['Teams'], afterMinutes: 60 },
    ],
    isRestrictedSafe: true,
  },
  {
    id: 'rule-connector-degraded',
    name: 'Connector degraded',
    isEnabled: false,
    channels: ['Email'],
    trigger: 'Connector marked degraded',
    conditions: 'Three failed health checks',
    recipients: ['Integration owner'],
    renotifyEveryMinutes: null,
    escalation: null,
    deliveryPreview: [],
    isRestrictedSafe: true,
  },
];

export const rulePackageFixtures: RulePackageDetail[] = [
  {
    id: 'package-eu-dora',
    jurisdiction: 'European Union',
    name: 'DORA ICT v4',
    effectiveFrom: '2026-09-01T00:00:00Z',
    signedOffBy: 'Legal and Compliance',
    clockRuleCount: 7,
    templates: ['Initial', 'Intermediate', 'Final'],
    activatedWorkspaceCount: 4,
    reviewDueAt: daysFromNow(18),
    conflicts: [],
    versions: [
      { version: 4, state: 'active', effectiveFrom: '2026-09-01T00:00:00Z' },
      { version: 3, state: 'superseded', effectiveFrom: '2026-01-17T00:00:00Z' },
      { version: 2, state: 'superseded', effectiveFrom: '2025-07-01T00:00:00Z' },
    ],
  },
  {
    id: 'package-uk-resilience',
    jurisdiction: 'United Kingdom',
    name: 'Operational Resilience v6',
    effectiveFrom: '2026-03-31T00:00:00Z',
    signedOffBy: 'Legal and Compliance',
    clockRuleCount: 5,
    templates: ['Initial', 'Final'],
    activatedWorkspaceCount: 3,
    reviewDueAt: daysFromNow(42),
    conflicts: [],
    versions: [
      { version: 6, state: 'active', effectiveFrom: '2026-03-31T00:00:00Z' },
      { version: 5, state: 'superseded', effectiveFrom: '2025-03-31T00:00:00Z' },
    ],
  },
  {
    id: 'package-sa-sama',
    jurisdiction: 'Saudi Arabia',
    name: 'SAMA Cloud v5',
    effectiveFrom: '2026-06-01T00:00:00Z',
    signedOffBy: null,
    clockRuleCount: 4,
    templates: ['Initial'],
    activatedWorkspaceCount: 0,
    reviewDueAt: daysFromNow(5),
    conflicts: ['Notification window overlaps the CBUAE outsourcing rule'],
    versions: [{ version: 5, state: 'draft', effectiveFrom: '2026-06-01T00:00:00Z' }],
  },
  {
    id: 'package-ae-cbuae',
    jurisdiction: 'United Arab Emirates',
    name: 'CBUAE Outsourcing v2',
    effectiveFrom: '2026-02-15T00:00:00Z',
    signedOffBy: 'Legal and Compliance',
    clockRuleCount: 3,
    templates: ['Initial', 'Final'],
    activatedWorkspaceCount: 1,
    reviewDueAt: daysFromNow(90),
    conflicts: [],
    versions: [{ version: 2, state: 'active', effectiveFrom: '2026-02-15T00:00:00Z' }],
  },
];

export function regulatorReportFixture(): RegulatorReport {
  return {
    id: 'report-inc-2041-dora-initial',
    obligationName: 'DORA initial notice',
    incidentReference: 'INC-2041',
    jurisdiction: 'UK',
    rulePackage: 'DORA ICT v4',
    stage: 'draft',
    deadlineAt: minutesFromNow(221),
    guessedTextCount: 0,
    fields: [
      {
        id: 'field-reference',
        name: 'Incident reference',
        status: 'complete',
        value: 'INC-2041',
        sources: [{ name: 'Incident record', detail: 'INC-2041' }],
        authorship: 'human',
        validation: 'verified',
        isRequired: true,
      },
      {
        id: 'field-detection',
        name: 'Detection time',
        status: 'complete',
        value: '09:14 UTC',
        sources: [{ name: 'Alertmanager', detail: 'payments-5xx-rate' }],
        authorship: 'human',
        validation: 'verified',
        isRequired: true,
      },
      {
        id: 'field-business-impact',
        name: 'Business impact',
        status: 'complete',
        value: 'GBP 184,000 at risk; 18,400 failed transactions',
        sources: [
          { name: 'Impact meter', detail: 'formula v8' },
          { name: 'Prometheus', detail: 'failed_transactions_total' },
        ],
        authorship: 'ai-accepted',
        validation: 'verified',
        isRequired: true,
      },
      {
        id: 'field-likely-cause',
        name: 'Likely cause',
        status: 'ai-suggested',
        value: 'Configuration regression in payments-api routing rules',
        sources: [{ name: 'Investigation', detail: 'Hypothesis 1, 82% confidence' }],
        authorship: 'ai-suggested-pending-review',
        validation: 'verified',
        isRequired: true,
      },
      {
        id: 'field-countries',
        name: 'Affected countries',
        status: 'complete',
        value: 'United Kingdom',
        sources: [{ name: 'Incident record', detail: 'Customer regions' }],
        authorship: 'human',
        validation: 'verified',
        isRequired: true,
      },
      {
        id: 'field-duration',
        name: 'Impact duration',
        status: 'needs-input',
        value: null,
        sources: [],
        authorship: 'human',
        validation: 'unverified',
        isRequired: true,
      },
      {
        id: 'field-mitigation',
        name: 'Mitigation status',
        status: 'complete',
        value: 'Rollback approved; verification running',
        sources: [{ name: 'Timeline', detail: 'ACT-7721 approved' }],
        authorship: 'human',
        validation: 'verified',
        isRequired: true,
      },
    ],
  };
}

export function postIncidentReviewFixture(): PostIncidentReview {
  return {
    incidentReference: 'INC-1998',
    incidentTitle: 'Card payment failures in UK',
    severity: 'SEV1',
    dueAt: daysFromNow(2),
    state: 'in-review',
    sections: [
      {
        id: 'summary',
        name: 'Summary',
        authorship: 'ai-generated',
        content: 'Card payment failures affected UK authorisations for 21 minutes.',
      },
      {
        id: 'impact',
        name: 'Impact',
        authorship: 'human-edited',
        content: 'GBP 92,000 at risk; 9,104 failed attempts.',
      },
      {
        id: 'root-cause',
        name: 'Root cause',
        authorship: 'ai-generated',
        content: 'A configuration rollout changed timeout behaviour.',
      },
      {
        id: 'went-well',
        name: 'What went well',
        authorship: 'human-edited',
        content: 'The rollback was approved within four minutes of the hypothesis.',
      },
      { id: 'went-badly', name: 'What went badly', authorship: 'pending', content: null },
      {
        id: 'follow-ups',
        name: 'Follow-ups',
        authorship: 'mixed',
        content: 'Add canary validation and rollback verification.',
      },
    ],
    reviewers: [
      { name: 'Sara Malik', role: 'Incident commander', signedAt: daysFromNow(-1) },
      { name: 'A. Rahman', role: 'Service owner', signedAt: null },
      { name: 'N. Ali', role: 'Compliance', signedAt: daysFromNow(-1) },
      { name: 'Head of SRE', role: 'Leadership', signedAt: null },
    ],
  };
}
