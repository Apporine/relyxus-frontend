'use client';

import {
  ActionCard,
  actionCardFactKeys,
  ClockWidget,
  clockPhases,
  Skeleton,
  type ActionCardFactKey,
  type ClockPhase,
} from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ExpiryCountdown } from '@/features/approvals/expiry-countdown';
import { approvalHref } from '@/features/approvals/routes';
import type { RegulatorClock } from '@/features/compliance/model';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

import type { Communications, ProposedAction } from './model';

function PendingActionCard({
  workspaceSlug,
  action,
}: {
  workspaceSlug: string;
  action: ProposedAction;
}) {
  const translateDecisions = useTranslations('warRoom.decisions');
  const translateEnvironments = useTranslations('domain.environments');
  const environmentLabel = translateEnvironments(action.environment);
  const factLabels = Object.fromEntries(
    actionCardFactKeys.map((factKey) => [factKey, translateDecisions(`factLabels.${factKey}`)]),
  ) as Record<ActionCardFactKey, string>;

  return (
    <ActionCard
      eyebrow={translateDecisions('actionEyebrow', { environment: environmentLabel })}
      title={action.title}
      environment={action.environment}
      environmentLabel={environmentLabel}
      state={action.state}
      stateLabel={translateDecisions(`actionStates.${action.state}`)}
      command={action.command}
      commandLabel={translateDecisions('command')}
      commandCopyLabels={{
        label: translateDecisions('copyCommand'),
        copiedLabel: translateDecisions('commandCopied'),
        failedLabel: translateDecisions('copyFailed'),
      }}
      facts={{
        ...action.facts,
        expiry:
          action.expiresAt === null ? null : (
            <ExpiryCountdown expiresAt={new Date(action.expiresAt)} />
          ),
      }}
      factLabels={factLabels}
      missingFactLabel={translateDecisions('missingFact')}
      incompleteNotice={translateDecisions('incompleteNotice')}
      // Deciding happens in the Approvals inbox, where re-confirmation and reasons are enforced.
      decision={
        action.approvalId === null ? undefined : (
          <Link
            href={approvalHref(workspaceSlug, action.approvalId)}
            className="inline-flex h-(--rx-control-height) items-center justify-center gap-2 rounded-button border border-action bg-action px-4 font-semibold text-action-fg hover:bg-fg-secondary"
          >
            {translateDecisions('openApproval')}
            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
          </Link>
        )
      }
    />
  );
}

function IncidentClocks({ clocks }: { clocks: RegulatorClock[] }) {
  const translateDecisions = useTranslations('warRoom.decisions');
  const translatePhases = useTranslations('domain.clockPhases');
  const format = useRelyxusFormat();
  const phaseLabels = Object.fromEntries(
    clockPhases.map((phase) => [phase, translatePhases(phase)]),
  ) as Record<ClockPhase, string>;

  if (clocks.length === 0) {
    return <p className="text-body text-fg-secondary">{translateDecisions('noClocks')}</p>;
  }
  return (
    <div className="flex flex-col divide-y divide-divider">
      {clocks.map((clock) => (
        <ClockWidget
          key={clock.id}
          size="compact"
          className="py-3 first:pt-0 last:pb-0"
          title={clock.obligationName}
          startedAt={new Date(clock.startedAt)}
          deadlineAt={new Date(clock.deadlineAt)}
          isSubmitted={clock.isSubmitted}
          phaseLabels={phaseLabels}
          deadlineText={format.timeOfDay(new Date(clock.deadlineAt))}
          details={`${clock.ownerName} · ${clock.rulePackage}`}
        />
      ))}
    </div>
  );
}

function CommunicationsSummary({ communications }: { communications: Communications }) {
  const translateDecisions = useTranslations('warRoom.decisions');
  const format = useRelyxusFormat();

  return (
    <div className="flex flex-col gap-1 text-body">
      <p className="font-semibold text-fg-primary">
        {communications.nextStakeholderUpdateDueAt === null
          ? translateDecisions('noUpdateScheduled')
          : translateDecisions('nextUpdateDue', {
              time: format.timeOfDay(new Date(communications.nextStakeholderUpdateDueAt)),
            })}
      </p>
      <p className="text-meta text-fg-secondary">
        {translateDecisions('draftsWaiting', { count: communications.draftsAwaitingApprovalCount })}
      </p>
    </div>
  );
}

/**
 * Proposed actions, clocks and communications (UI/UX s. 10.4 right panel). A pending
 * decision is always visible, whatever the layout.
 */
export function DecisionsPanel({
  workspaceSlug,
  actionsQuery,
  clocksQuery,
  communicationsQuery,
}: {
  workspaceSlug: string;
  actionsQuery: UseQueryResult<ProposedAction[]>;
  clocksQuery: UseQueryResult<RegulatorClock[]>;
  communicationsQuery: UseQueryResult<Communications>;
}) {
  const translatePanels = useTranslations('warRoom.panels');
  const translateDecisions = useTranslations('warRoom.decisions');

  return (
    <div className="flex flex-col gap-6">
      <Panel title={translateDecisions('pendingDecision')}>
        <QuerySection
          query={actionsQuery}
          sectionName={translatePanels('decisions')}
          loadingPlaceholder={<Skeleton className="h-72 w-full" />}
        >
          {(actions) =>
            actions.length === 0 ? (
              <p className="text-body text-fg-secondary">
                {translateDecisions('noPendingActions')}
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {actions.map((action) => (
                  <PendingActionCard
                    key={action.id}
                    workspaceSlug={workspaceSlug}
                    action={action}
                  />
                ))}
              </div>
            )
          }
        </QuerySection>
      </Panel>
      <Panel title={translateDecisions('clocks')}>
        <QuerySection
          query={clocksQuery}
          sectionName={translateDecisions('clocks')}
          loadingPlaceholder={<Skeleton className="h-20 w-full" />}
        >
          {(clocks) => <IncidentClocks clocks={clocks} />}
        </QuerySection>
      </Panel>
      <Panel title={translateDecisions('communications')}>
        <QuerySection
          query={communicationsQuery}
          sectionName={translateDecisions('communications')}
          loadingPlaceholder={<Skeleton className="h-12 w-full" />}
        >
          {(communications) => <CommunicationsSummary communications={communications} />}
        </QuerySection>
      </Panel>
    </div>
  );
}
