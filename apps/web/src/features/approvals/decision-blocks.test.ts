import { describe, expect, it } from 'vitest';

import { decisionBlocksFor, hasMissingParts } from './decision-blocks';
import type { ApprovalDetail } from './model';

function baseApproval(overrides: Partial<ApprovalDetail> = {}): ApprovalDetail {
  return {
    id: 'approval-test',
    kind: 'production-action',
    title: 'Restart payments-api',
    incidentReference: 'INC-2041',
    incident: {
      reference: 'INC-2041',
      title: 'Card authorisation failures in UK',
      severity: 'SEV1',
      visibility: 'workspace',
    },
    target: 'payments-api / PROD',
    environment: 'production',
    blastRadius: '3 pods',
    quorum: { approved: 1, required: 2 },
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    requestedByName: 'Daniel Okafor',
    command: {
      text: 'kubectl rollout restart deployment/payments-api -n payments',
      cluster: 'prod-eu-west-2',
      namespace: 'payments',
    },
    expectedResult: 'Pods restart safely.',
    evidence: [],
    effectivePolicy: {
      name: 'Payments PROD v18',
      constraints: ['Two approvers'],
      conflicts: [],
    },
    consequences: {
      risk: 'Brief capacity drop.',
      rollback: 'Roll back to revision 184.',
      verification: '5xx below 2%.',
    },
    mfaRequired: false,
    decisionBlockReason: null,
    ...overrides,
  };
}

describe('hasMissingParts', () => {
  it('is false when every part is present', () => {
    expect(hasMissingParts(baseApproval())).toBe(false);
  });

  it('is true when the command is missing', () => {
    expect(hasMissingParts(baseApproval({ command: null }))).toBe(true);
  });
});

describe('decisionBlocksFor', () => {
  it('blocks both actions while the live connection is down', () => {
    expect(decisionBlocksFor(baseApproval(), { hasExpired: false, canChangeState: false })).toEqual(
      { approve: 'live-connection-lost', reject: 'live-connection-lost' },
    );
  });

  it('blocks approve for MFA but still allows reject', () => {
    expect(
      decisionBlocksFor(baseApproval({ mfaRequired: true }), {
        hasExpired: false,
        canChangeState: true,
      }),
    ).toEqual({ approve: 'mfa-unavailable', reject: null });
  });

  it('blocks approve for non-production kinds but still allows reject', () => {
    expect(
      decisionBlocksFor(baseApproval({ kind: 'report' }), {
        hasExpired: false,
        canChangeState: true,
      }),
    ).toEqual({ approve: 'kind-unsupported', reject: null });
  });

  it('honours server-side eligibility blocks for both actions', () => {
    expect(
      decisionBlocksFor(baseApproval({ decisionBlockReason: 'waiting-for-others' }), {
        hasExpired: false,
        canChangeState: true,
      }),
    ).toEqual({ approve: 'waiting-for-others', reject: 'waiting-for-others' });
  });
});
