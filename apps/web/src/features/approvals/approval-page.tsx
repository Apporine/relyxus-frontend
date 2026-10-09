'use client';

import { CodeBlock, EnvironmentBadge } from '@relyxus/ui';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useCanChangeState } from '@/lib/live/live-updates-provider';
import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { ApprovalConsequenceLadder } from './approval-consequence-ladder';
import { approvalsInboxHref } from './approval-params';
import { useApprovalDetail } from './queries';

/**
 * One approval on its own page (UI/UX s. 15, Figma frame 38): the phone layout and the target
 * of push notifications. The decision controls are the inbox's own, so every rule — expiry,
 * quorum, MFA, a lost live connection — applies here unchanged.
 */
export function ApprovalPage({ approvalId }: { approvalId: string }) {
  const translateInbox = useTranslations('approvals.inbox');
  const translatePage = useTranslations('approvals.page');
  const translateEnvironments = useTranslations('domain.environments');
  const router = useRouter();
  const { workspace } = useCurrentWorkspace();
  const canChangeState = useCanChangeState();
  const detailQuery = useApprovalDetail(workspace.slug, approvalId);

  if (detailQuery.isPending) {
    return <PageLoadingState />;
  }
  if (detailQuery.isError) {
    return isHiddenOrMissing(detailQuery.error) ? (
      <NoAccessState />
    ) : (
      <PageLoadFailedState
        error={detailQuery.error}
        sectionName={translateInbox('detailSectionName')}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const approval = detailQuery.data;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <header className="flex flex-col gap-2">
        <p className="text-meta font-semibold text-warning uppercase">
          {translatePage('approvalNeeded')}
        </p>
        <h1 className="text-section-title font-semibold">{approval.title}</h1>
        <EnvironmentBadge
          environment={approval.environment}
          label={translateEnvironments(approval.environment)}
          className="self-start"
        />
      </header>
      {approval.command === null ? null : (
        <CodeBlock code={approval.command.text} label={translateInbox('commandLabel')} />
      )}
      <ApprovalConsequenceLadder
        workspaceSlug={workspace.slug}
        approval={approval}
        canChangeState={canChangeState}
        onDecided={() => router.push(approvalsInboxHref(workspace.slug))}
      />
    </div>
  );
}
