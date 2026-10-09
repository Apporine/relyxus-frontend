'use client';

import {
  Button,
  ClockWidget,
  clockPhases,
  confidenceBandFor,
  EnvironmentBadge,
  SeverityBadge,
  Skeleton,
  type ClockPhase,
} from '@relyxus/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { ExpiryCountdown } from '@/features/approvals/expiry-countdown';
import { approvalPageHref } from '@/features/approvals/routes';
import { incidentWarRoomHref } from '@/features/incidents/routes';
import { useWarRoomData } from '@/features/war-room/queries';
import { useAcknowledgeIncidentAction } from '@/features/war-room/use-acknowledge-incident-action';
import { nearestRunningClock } from '@/features/war-room/war-room-header';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { PageLoadingState } from '@/lib/ui/page-loading-state';
import { isHiddenOrMissing, NoAccessState, PageLoadFailedState } from '@/lib/ui/page-states';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

function SummaryCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-panel border border-control bg-surface-1 p-4">
      <h2 className="text-meta font-semibold text-fg-tertiary uppercase">{title}</h2>
      {children}
    </section>
  );
}

/**
 * The phone summary of an incident (UI/UX s. 15, Figma frame 37): impact, the nearest clock,
 * the top hypothesis and the pending decision, with Acknowledge one tap away. Push
 * notifications deep-link here.
 */
export function IncidentSummaryPage({ incidentReference }: { incidentReference: string }) {
  const translateSummary = useTranslations('mobileSummary');
  const translateEnvironments = useTranslations('domain.environments');
  const translatePhases = useTranslations('domain.clockPhases');
  const translateBands = useTranslations('domain.confidenceBands');
  const format = useRelyxusFormat();
  const { workspace } = useCurrentWorkspace();
  const { incidentQuery, investigationQuery, actionsQuery, clocksQuery } = useWarRoomData(
    workspace.slug,
    incidentReference,
  );
  const acknowledgeAction = useAcknowledgeIncidentAction(workspace.slug, incidentQuery.data);

  if (incidentQuery.isPending) {
    return <PageLoadingState />;
  }
  if (incidentQuery.isError) {
    return isHiddenOrMissing(incidentQuery.error) ? (
      <NoAccessState />
    ) : (
      <PageLoadFailedState
        error={incidentQuery.error}
        sectionName={translateSummary('title')}
        onRetry={() => void incidentQuery.refetch()}
      />
    );
  }

  const incident = incidentQuery.data;
  const nearestClock = nearestRunningClock(clocksQuery.data);
  const topHypothesis = investigationQuery.data?.hypotheses.find(
    (hypothesis) => hypothesis.status !== 'ruled-out',
  );
  const pendingAction = actionsQuery.data?.find(
    (action) => action.state === 'waiting-for-approval' && action.approvalId !== null,
  );
  const phaseLabels = Object.fromEntries(
    clockPhases.map((phase) => [phase, translatePhases(phase)]),
  ) as Record<ClockPhase, string>;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <header className="flex flex-col gap-2">
        <span dir="ltr" className="self-start font-mono text-table text-fg-tertiary">
          {incident.reference}
        </span>
        <h1 className="text-section-title font-semibold">{incident.title}</h1>
        <div className="flex flex-wrap gap-2">
          <SeverityBadge severity={incident.severity} />
          <EnvironmentBadge
            environment={incident.environment}
            label={translateEnvironments(incident.environment)}
          />
        </div>
      </header>

      <SummaryCard title={translateSummary('impact')}>
        <p className="text-body font-semibold">
          {incident.impact.moneyAtRisk === null
            ? translateSummary('impactUnknown')
            : translateSummary('moneyAtRisk', {
                amount: format.money(incident.impact.moneyAtRisk),
              })}
          {incident.impact.failedTransactions === null
            ? null
            : ` · ${translateSummary('failed', { count: format.compactCount(incident.impact.failedTransactions) })}`}
        </p>
        {nearestClock === undefined ? null : (
          <ClockWidget
            size="compact"
            title={nearestClock.obligationName}
            startedAt={new Date(nearestClock.startedAt)}
            deadlineAt={new Date(nearestClock.deadlineAt)}
            phaseLabels={phaseLabels}
            deadlineText={format.timeOfDay(new Date(nearestClock.deadlineAt))}
          />
        )}
      </SummaryCard>

      <SummaryCard title={translateSummary('topHypothesis')}>
        {investigationQuery.isPending ? (
          <Skeleton className="h-12 w-full" />
        ) : topHypothesis === undefined ? (
          <p className="text-body text-fg-secondary">{translateSummary('noHypothesis')}</p>
        ) : (
          <>
            <p className="text-body font-semibold">{topHypothesis.cause}</p>
            <p className="text-meta text-fg-secondary">
              {translateSummary('confidence', {
                percent: topHypothesis.confidencePercent / 100,
                band: translateBands(confidenceBandFor(topHypothesis.confidencePercent)),
              })}
              {' · '}
              {translateSummary('evidenceCounts', {
                supporting: topHypothesis.supportingEvidenceCount,
                refuting: topHypothesis.refutingEvidenceCount,
              })}
            </p>
          </>
        )}
      </SummaryCard>

      {pendingAction === undefined || pendingAction.approvalId === null ? null : (
        <SummaryCard title={translateSummary('pendingDecision')}>
          <p className="text-body font-semibold">
            {translateSummary('actionWithEnvironment', {
              title: pendingAction.title,
              environment: translateEnvironments(pendingAction.environment),
            })}
          </p>
          {pendingAction.facts.target === null ? null : (
            <p className="text-meta text-fg-secondary">{pendingAction.facts.target}</p>
          )}
          {pendingAction.expiresAt === null ? null : (
            <ExpiryCountdown expiresAt={new Date(pendingAction.expiresAt)} className="self-start" />
          )}
          <Button asChild variant="secondary" size="large" className="w-full">
            <Link href={approvalPageHref(workspace.slug, pendingAction.approvalId)}>
              {translateSummary('openApproval')}
            </Link>
          </Button>
        </SummaryCard>
      )}

      {incident.acknowledgement === null ? (
        <Button
          variant="primary"
          size="large"
          className="w-full"
          onClick={acknowledgeAction.acknowledge}
          isLoading={acknowledgeAction.isAcknowledging}
          disabled={!acknowledgeAction.canAcknowledge}
        >
          {translateSummary('acknowledge')}
        </Button>
      ) : (
        <p className="text-center text-meta text-fg-secondary">
          {translateSummary('acknowledgedBy', {
            name: incident.acknowledgement.acknowledgedByName,
            time: format.timeOfDay(new Date(incident.acknowledgement.acknowledgedAt)),
          })}
        </p>
      )}

      <Link
        href={incidentWarRoomHref(workspace.slug, incident.reference)}
        className="text-center text-table font-semibold text-fg-secondary underline underline-offset-2"
      >
        {translateSummary('openWarRoom')}
      </Link>
    </div>
  );
}
