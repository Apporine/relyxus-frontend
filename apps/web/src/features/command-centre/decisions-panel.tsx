'use client';

import { EnvironmentBadge, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ExpiryCountdown } from '@/features/approvals/expiry-countdown';
import type { PendingApproval } from '@/features/approvals/model';
import { approvalHref } from '@/features/approvals/routes';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

/** Two decisions keep the column scannable; the Approvals inbox holds the full queue. */
const MAX_VISIBLE_DECISIONS = 2;

function PendingDecision({
  workspaceSlug,
  approval,
}: {
  workspaceSlug: string;
  approval: PendingApproval;
}) {
  const translateDecisions = useTranslations('commandCentre.decisions');
  const translateEnvironments = useTranslations('domain.environments');

  return (
    <article className="flex flex-col gap-3 rounded-panel border border-warning bg-surface-2 p-4">
      <header className="flex flex-col gap-1">
        <p className="text-meta font-semibold text-warning uppercase">
          {translateDecisions('productionApproval')}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-panel-title font-semibold text-fg-primary">{approval.title}</h3>
          <EnvironmentBadge
            environment={approval.environment}
            label={translateEnvironments(approval.environment)}
          />
        </div>
      </header>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-table">
        <dt className="text-fg-tertiary">{translateDecisions('target')}</dt>
        <dd className="font-mono text-fg-primary" dir="ltr">
          {approval.target}
        </dd>
        <dt className="text-fg-tertiary">{translateDecisions('blastRadius')}</dt>
        <dd className="text-fg-primary">{approval.blastRadius}</dd>
        <dt className="text-fg-tertiary">{translateDecisions('quorum')}</dt>
        <dd className="text-fg-primary">
          {translateDecisions('quorumProgress', {
            approved: approval.quorum.approved,
            required: approval.quorum.required,
          })}
        </dd>
      </dl>
      <footer className="flex flex-wrap items-center justify-between gap-3">
        <ExpiryCountdown expiresAt={new Date(approval.expiresAt)} />
        <Link
          href={approvalHref(workspaceSlug, approval.id)}
          className="inline-flex items-center gap-1.5 text-table font-semibold text-fg-primary hover:underline"
        >
          {translateDecisions('review')}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      </footer>
    </article>
  );
}

export function DecisionsPanel({
  workspaceSlug,
  query,
}: {
  workspaceSlug: string;
  query: UseQueryResult<PendingApproval[]>;
}) {
  const translateDecisions = useTranslations('commandCentre.decisions');

  return (
    <Panel title={translateDecisions('heading')}>
      <QuerySection
        query={query}
        sectionName={translateDecisions('heading')}
        loadingPlaceholder={<Skeleton className="h-44 w-full" />}
      >
        {(approvals) =>
          approvals.length === 0 ? (
            <p className="text-body text-fg-secondary">{translateDecisions('noneWaiting')}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {approvals.slice(0, MAX_VISIBLE_DECISIONS).map((approval) => (
                <PendingDecision
                  key={approval.id}
                  workspaceSlug={workspaceSlug}
                  approval={approval}
                />
              ))}
            </div>
          )
        }
      </QuerySection>
    </Panel>
  );
}
