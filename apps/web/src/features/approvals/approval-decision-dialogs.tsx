'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Textarea,
  useToast,
} from '@relyxus/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError } from '@/lib/api/api-error';
import { newIdempotencyKey } from '@/lib/api/http-client';

import type { ApprovalDecisionRequest, ApprovalDetail } from './model';
import { useDecideApproval } from './queries';

type DecisionDialogProps = {
  workspaceSlug: string;
  approval: ApprovalDetail;
  environmentLabel: string;
  /** Called once the server has recorded the decision. */
  onDecided: () => void;
};

/**
 * Submits one decision intent. The idempotency key is created when the dialog opens (each
 * dialog mounts its content afresh), so retrying after a failure never counts twice.
 */
function useDecisionSubmission({ workspaceSlug, approval, onDecided }: DecisionDialogProps) {
  const translateInbox = useTranslations('approvals.inbox');
  const translateCommon = useTranslations('common');
  const { showToast } = useToast();
  const [idempotencyKey] = useState(newIdempotencyKey);
  const decideApproval = useDecideApproval(workspaceSlug, approval.id);

  function submitDecision(decision: ApprovalDecisionRequest) {
    decideApproval.mutate(
      { decision, idempotencyKey },
      {
        onSuccess: ({ outcome, quorum }) => {
          showToast({
            tone: 'success',
            title: translateInbox(`outcomes.${outcome}`, {
              title: approval.title,
              approved: quorum.approved,
              required: quorum.required,
            }),
          });
          onDecided();
        },
        onError: (error) =>
          showToast({
            tone: 'error',
            title: translateInbox('decisionFailed'),
            description: translateInbox('decisionFailedDetail', {
              reference:
                error instanceof ApiError && error.correlationId !== undefined
                  ? error.correlationId
                  : translateCommon('notReported'),
            }),
          }),
      },
    );
  }

  return { submitDecision, isSubmitting: decideApproval.isPending };
}

/** Approving always takes a deliberate confirmation that names the target (UI/UX s. 7). */
export function ApproveDialogContent({
  policyName,
  ...dialogProps
}: DecisionDialogProps & { policyName: string }) {
  const translateInbox = useTranslations('approvals.inbox');
  const { submitDecision, isSubmitting } = useDecisionSubmission(dialogProps);
  const { approval, environmentLabel } = dialogProps;
  const targetNames = { title: approval.title, environment: environmentLabel };

  return (
    <DialogContent closeLabel={translateInbox('closeDialog')}>
      <DialogHeader>
        <DialogTitle>{translateInbox('confirmApprove.title', targetNames)}</DialogTitle>
        <DialogDescription>
          {translateInbox('confirmApprove.description', { policy: policyName })}
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-table">
          <dt className="text-fg-tertiary">{translateInbox('consequenceSteps.target')}</dt>
          <dd dir="ltr" className="font-mono text-fg-primary">
            {approval.target}
          </dd>
          <dt className="text-fg-tertiary">{translateInbox('consequenceSteps.blastRadius')}</dt>
          <dd className="text-fg-primary">{approval.blastRadius}</dd>
        </dl>
      </DialogBody>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="tertiary">{translateInbox('confirmApprove.cancel')}</Button>
        </DialogClose>
        <Button
          variant="primary"
          isLoading={isSubmitting}
          onClick={() => {
            if (!isSubmitting) {
              submitDecision({ decision: 'approve' });
            }
          }}
        >
          {translateInbox('confirmApprove.confirm', targetNames)}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

const rejectionFormSchema = z.object({ reason: z.string().trim().min(1) });

/** A production action is only ever rejected with a reason (UI/UX s. 11.2). */
export function RejectDialogContent(dialogProps: DecisionDialogProps) {
  const translateInbox = useTranslations('approvals.inbox');
  const { submitDecision, isSubmitting } = useDecisionSubmission(dialogProps);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(rejectionFormSchema), defaultValues: { reason: '' } });

  const submitRejection = handleSubmit(({ reason }) => {
    if (!isSubmitting) {
      submitDecision({ decision: 'reject', reason });
    }
  });

  return (
    <DialogContent closeLabel={translateInbox('closeDialog')}>
      <form noValidate onSubmit={(event) => void submitRejection(event)}>
        <DialogHeader>
          <DialogTitle>
            {translateInbox('reject.title', { title: dialogProps.approval.title })}
          </DialogTitle>
          <DialogDescription>{translateInbox('reject.description')}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <FormField
            label={translateInbox('reject.reasonLabel')}
            isRequired
            requiredLabel={translateInbox('reject.reasonRequired')}
            helpText={translateInbox('reject.reasonHelp')}
            errorMessage={
              errors.reason === undefined ? undefined : translateInbox('reject.reasonMissing')
            }
          >
            {(controlProps) => <Textarea rows={4} {...controlProps} {...register('reason')} />}
          </FormField>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="tertiary">
              {translateInbox('reject.cancel')}
            </Button>
          </DialogClose>
          <Button type="submit" variant="danger" isLoading={isSubmitting}>
            {translateInbox('reject.confirm')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
