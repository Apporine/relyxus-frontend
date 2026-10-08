'use client';

import { cn, EnvironmentBadge, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

import { ExpiryCountdown } from './expiry-countdown';
import type { PendingApproval } from './model';
import { approvalHref } from './routes';

function ApprovalQueueRow({
  workspaceSlug,
  approval,
  isSelected,
}: {
  workspaceSlug: string;
  approval: PendingApproval;
  isSelected: boolean;
}) {
  const translateInbox = useTranslations('approvals.inbox');
  const translateEnvironments = useTranslations('domain.environments');

  return (
    <li>
      <Link
        href={approvalHref(workspaceSlug, approval.id)}
        replace
        scroll={false}
        aria-current={isSelected ? 'true' : undefined}
        className={cn(
          'flex flex-col gap-2 rounded-panel border p-3 transition-colors hover:bg-surface-2',
          isSelected ? 'border-action bg-selected' : 'border-divider',
        )}
      >
        <span className="text-meta font-semibold text-fg-secondary uppercase">
          {translateInbox(`kinds.${approval.kind}`)}
          {approval.incidentReference === null ? null : ` · ${approval.incidentReference}`}
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-body font-semibold text-fg-primary">{approval.title}</span>
          <EnvironmentBadge
            environment={approval.environment}
            label={translateEnvironments(approval.environment)}
          />
        </span>
        <span className="flex flex-wrap items-center justify-between gap-2 text-meta text-fg-secondary">
          {translateInbox('quorumProgress', {
            approved: approval.quorum.approved,
            required: approval.quorum.required,
          })}
          <ExpiryCountdown expiresAt={new Date(approval.expiresAt)} />
        </span>
      </Link>
    </li>
  );
}

function ApprovalQueueSection({
  workspaceSlug,
  title,
  emptyText,
  query,
  selectedApprovalId,
}: {
  workspaceSlug: string;
  title: string;
  emptyText: string;
  query: UseQueryResult<PendingApproval[]>;
  selectedApprovalId: string | null;
}) {
  return (
    <Panel title={title} titleStyle="label">
      <QuerySection
        query={query}
        sectionName={title}
        loadingPlaceholder={<Skeleton className="h-28 w-full" />}
      >
        {(approvals) =>
          approvals.length === 0 ? (
            <p className="text-body text-fg-secondary">{emptyText}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {approvals.map((approval) => (
                <ApprovalQueueRow
                  key={approval.id}
                  workspaceSlug={workspaceSlug}
                  approval={approval}
                  isSelected={approval.id === selectedApprovalId}
                />
              ))}
            </ul>
          )
        }
      </QuerySection>
    </Panel>
  );
}

/** Left column (UI/UX s. 11.2): requests I can decide first, then those waiting on others. */
export function ApprovalQueue({
  workspaceSlug,
  waitingForMeQuery,
  waitingForOthersQuery,
  selectedApprovalId,
}: {
  workspaceSlug: string;
  waitingForMeQuery: UseQueryResult<PendingApproval[]>;
  waitingForOthersQuery: UseQueryResult<PendingApproval[]>;
  selectedApprovalId: string | null;
}) {
  const translateInbox = useTranslations('approvals.inbox');

  return (
    <nav aria-label={translateInbox('queueLabel')} className="flex flex-col gap-4">
      <ApprovalQueueSection
        workspaceSlug={workspaceSlug}
        title={translateInbox('waitingForYou')}
        emptyText={translateInbox('emptyMine')}
        query={waitingForMeQuery}
        selectedApprovalId={selectedApprovalId}
      />
      <ApprovalQueueSection
        workspaceSlug={workspaceSlug}
        title={translateInbox('waitingForOthers')}
        emptyText={translateInbox('emptyOthers')}
        query={waitingForOthersQuery}
        selectedApprovalId={selectedApprovalId}
      />
    </nav>
  );
}
