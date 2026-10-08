'use client';

import {
  Button,
  cn,
  Dialog,
  DialogTrigger,
  formatCountdown,
  Tooltip,
  useCurrentTime,
} from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { Panel } from '@/lib/ui/panel';

import { ApproveDialogContent, RejectDialogContent } from './approval-decision-dialogs';
import { decisionBlocksFor, type DecisionBlock } from './decision-blocks';
import type { ApprovalDetail } from './model';

const COUNTDOWN_REFRESH_MS = 1_000;
const FINAL_WARNING_MS = 120_000;

const consequenceStepOrder = [
  'target',
  'blastRadius',
  'risk',
  'quorum',
  'rollback',
  'verification',
] as const;

function blockedMessage(
  block: DecisionBlock,
  approval: ApprovalDetail,
  translateInbox: ReturnType<typeof useTranslations<'approvals.inbox'>>,
): string {
  if (block === 'kind-unsupported') {
    return translateInbox('blocked.kind-unsupported', {
      kind: translateInbox(`kinds.${approval.kind}`),
    });
  }
  return translateInbox(`blocked.${block}`);
}

function LargeExpiryCountdown({ expiresAt }: { expiresAt: Date }) {
  const translateInbox = useTranslations('approvals.inbox');
  const translateApprovals = useTranslations('approvals');
  const currentTime = useCurrentTime(COUNTDOWN_REFRESH_MS);
  const remainingMs = currentTime === null ? null : expiresAt.getTime() - currentTime.getTime();
  const hasExpired = remainingMs !== null && remainingMs <= 0;
  const isInFinalWarning = remainingMs !== null && remainingMs <= FINAL_WARNING_MS;

  return (
    <div className="flex flex-col gap-1 rounded-panel border border-control bg-surface-2 px-4 py-3">
      <span className="text-meta font-semibold text-fg-secondary uppercase">
        {translateInbox('expiresLabel')}
      </span>
      <span
        role="timer"
        className={cn(
          'text-section-title font-semibold tabular-nums',
          hasExpired || isInFinalWarning ? 'text-critical' : 'text-warning',
        )}
      >
        {hasExpired
          ? translateApprovals('expired')
          : translateApprovals('timeLeft', {
              time: remainingMs === null ? '--:--' : formatCountdown(remainingMs),
            })}
      </span>
    </div>
  );
}

/** Right column (UI/UX s. 11.2): numbered consequences, quorum and decision controls. */
export function ApprovalConsequenceLadder({
  workspaceSlug,
  approval,
  canChangeState,
  onDecided,
}: {
  workspaceSlug: string;
  approval: ApprovalDetail;
  canChangeState: boolean;
  onDecided: () => void;
}) {
  const translateInbox = useTranslations('approvals.inbox');
  const translateEnvironments = useTranslations('domain.environments');
  const currentTime = useCurrentTime(COUNTDOWN_REFRESH_MS);
  const environmentLabel = translateEnvironments(approval.environment);
  const hasExpired =
    approval.decisionBlockReason === 'expired' ||
    (currentTime !== null && Date.parse(approval.expiresAt) <= currentTime.getTime());
  const blocks = decisionBlocksFor(approval, { hasExpired, canChangeState });
  const policyName = approval.effectivePolicy?.name ?? translateInbox('missingPart');

  const stepValues: Record<(typeof consequenceStepOrder)[number], string | null> = {
    target: approval.target,
    blastRadius: approval.blastRadius,
    risk: approval.consequences.risk,
    quorum: translateInbox('quorumProgress', {
      approved: approval.quorum.approved,
      required: approval.quorum.required,
    }),
    rollback: approval.consequences.rollback,
    verification: approval.consequences.verification,
  };

  const approveTargetNames = { title: approval.title, environment: environmentLabel };

  return (
    <Panel title={translateInbox('consequences')}>
      <ol className="flex flex-col gap-3">
        {consequenceStepOrder.map((stepKey, index) => {
          const value = stepValues[stepKey];
          return (
            <li key={stepKey} className="flex gap-3">
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full border border-control bg-surface-2 text-meta font-semibold text-fg-secondary tabular-nums"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-meta font-semibold text-fg-tertiary uppercase">
                  {translateInbox(`consequenceSteps.${stepKey}`)}
                </span>
                <span
                  className={cn(
                    'text-body',
                    value === null ? 'font-semibold text-warning' : 'text-fg-primary',
                  )}
                  dir={stepKey === 'target' ? 'ltr' : undefined}
                >
                  {value ?? translateInbox('missingPart')}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {blocks.approve === null && approval.decisionBlockReason === null ? (
        <p className="text-body text-fg-secondary">
          {translateInbox('yourApprovalPosition', {
            position: approval.quorum.approved + 1,
            required: approval.quorum.required,
          })}
        </p>
      ) : null}

      {approval.mfaRequired ? (
        <p className="text-meta font-semibold text-warning">{translateInbox('mfaRequired')}</p>
      ) : null}

      <LargeExpiryCountdown expiresAt={new Date(approval.expiresAt)} />

      {blocks.approve !== null ? (
        <p
          role="note"
          className="rounded-panel border border-warning bg-warning-subtle px-3 py-2 text-table"
        >
          {blockedMessage(blocks.approve, approval, translateInbox)}
        </p>
      ) : null}

      {blocks.reject !== null ? (
        <p
          role="note"
          className="rounded-panel border border-warning bg-warning-subtle px-3 py-2 text-table"
        >
          {blockedMessage(blocks.reject, approval, translateInbox)}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {blocks.approve === null ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary" size="large" className="w-full">
                {translateInbox('approveTarget', approveTargetNames)}
              </Button>
            </DialogTrigger>
            <ApproveDialogContent
              key={`approve-${approval.id}`}
              workspaceSlug={workspaceSlug}
              approval={approval}
              environmentLabel={environmentLabel}
              policyName={policyName}
              onDecided={onDecided}
            />
          </Dialog>
        ) : (
          <Button variant="primary" size="large" className="w-full" disabled>
            {translateInbox('approveTarget', approveTargetNames)}
          </Button>
        )}

        {blocks.reject === null ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="danger" size="large" className="w-full">
                {translateInbox('rejectWithReason')}
              </Button>
            </DialogTrigger>
            <RejectDialogContent
              key={`reject-${approval.id}`}
              workspaceSlug={workspaceSlug}
              approval={approval}
              environmentLabel={environmentLabel}
              onDecided={onDecided}
            />
          </Dialog>
        ) : (
          <Button variant="danger" size="large" className="w-full" disabled>
            {translateInbox('rejectWithReason')}
          </Button>
        )}

        <Tooltip content={translateInbox('askQuestionUnavailable')}>
          <Button variant="secondary" size="large" className="w-full" disabled>
            {translateInbox('askQuestion')}
          </Button>
        </Tooltip>
      </div>
    </Panel>
  );
}
