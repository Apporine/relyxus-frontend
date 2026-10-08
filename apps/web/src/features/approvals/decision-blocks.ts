import type { ApprovalDetail, DecisionBlockReason } from './model';

/*
 * Why a decision control is unavailable. The server decides eligibility and enforces every rule
 * again; the interface only explains, and never offers a decision the server would refuse
 * (UI/UX s. 11.1 and 11.2).
 */
export type DecisionBlock =
  | DecisionBlockReason
  | 'live-connection-lost'
  | 'kind-unsupported'
  | 'incomplete'
  | 'mfa-unavailable';

export type DecisionBlocks = {
  approve: DecisionBlock | null;
  reject: DecisionBlock | null;
};

type DecisionContext = {
  hasExpired: boolean;
  /** False while the live connection is down (UI/UX s. 8). */
  canChangeState: boolean;
};

/** True when a consequence ladder or action card part cannot be shown. */
export function hasMissingParts(approval: ApprovalDetail): boolean {
  return (
    approval.command === null ||
    approval.effectivePolicy === null ||
    Object.values(approval.consequences).some((consequence) => consequence === null)
  );
}

function sharedBlock(
  approval: ApprovalDetail,
  { hasExpired, canChangeState }: DecisionContext,
): DecisionBlock | null {
  if (approval.decisionBlockReason !== null) {
    return approval.decisionBlockReason;
  }
  if (hasExpired) {
    return 'expired';
  }
  return canChangeState ? null : 'live-connection-lost';
}

/**
 * Rejecting is always safe once the person may decide. Approving also needs a reviewable kind,
 * every part of the card and, where policy demands it, multi-factor re-confirmation, which waits
 * on the Identity capability (open question Q5).
 */
export function decisionBlocksFor(
  approval: ApprovalDetail,
  context: DecisionContext,
): DecisionBlocks {
  const blockForBoth = sharedBlock(approval, context);
  if (blockForBoth !== null) {
    return { approve: blockForBoth, reject: blockForBoth };
  }
  if (approval.kind !== 'production-action') {
    return { approve: 'kind-unsupported', reject: null };
  }
  if (hasMissingParts(approval)) {
    return { approve: 'incomplete', reject: null };
  }
  return { approve: approval.mfaRequired ? 'mfa-unavailable' : null, reject: null };
}
