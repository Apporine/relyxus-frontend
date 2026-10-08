'use client';

import {
  Button,
  ClockWidget,
  clockPhases,
  EnvironmentBadge,
  SeverityBadge,
  StateBadge,
  useCurrentTime,
  VisibilityBadge,
  type ClockPhase,
} from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import type { RegulatorClock } from '@/features/compliance/model';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';

import type { IncidentDetail } from './model';
import type { AcknowledgeIncidentAction } from './use-acknowledge-incident-action';

const AGE_REFRESH_MS = 60_000;

/** The clock closest to its deadline among those still running. */
export function nearestRunningClock(
  clocks: readonly RegulatorClock[] | undefined,
): RegulatorClock | undefined {
  return clocks
    ?.filter((clock) => !clock.isSubmitted)
    .toSorted((first, second) => Date.parse(first.deadlineAt) - Date.parse(second.deadlineAt))[0];
}

function HeaderFigure({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-panel-title font-semibold text-fg-primary tabular-nums">{value}</span>
      <span className="text-meta text-fg-tertiary">{label}</span>
    </div>
  );
}

type WarRoomHeaderProps = {
  incident: IncidentDetail;
  clocks: readonly RegulatorClock[] | undefined;
  acknowledgeAction: AcknowledgeIncidentAction;
};

/**
 * Sticky incident header (UI/UX s. 10.4). It stays visible in every layout together with the
 * nearest clock, so impact and deadline are never more than a glance away.
 */
export function WarRoomHeader({ incident, clocks, acknowledgeAction }: WarRoomHeaderProps) {
  const translateHeader = useTranslations('warRoom.header');
  const translateStates = useTranslations('domain.incidentStates');
  const translateEnvironments = useTranslations('domain.environments');
  const translateVisibilities = useTranslations('domain.visibilities');
  const translatePhases = useTranslations('domain.clockPhases');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(AGE_REFRESH_MS);
  const nearestClock = nearestRunningClock(clocks);
  const phaseLabels = Object.fromEntries(
    clockPhases.map((phase) => [phase, translatePhases(phase)]),
  ) as Record<ClockPhase, string>;

  return (
    <header className="sticky top-0 z-(--rx-layer-sticky) -mx-4 flex flex-col gap-4 border-b border-divider bg-canvas px-4 py-4 tablet:-mx-6 tablet:px-6 desktop:flex-row desktop:items-start desktop:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <SeverityBadge severity={incident.severity} />
          <span className="font-mono text-table text-fg-tertiary" dir="ltr">
            {incident.reference}
          </span>
        </div>
        <h1 className="text-page-title font-semibold text-fg-primary">{incident.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <StateBadge label={translateStates(incident.state)} />
          <EnvironmentBadge
            environment={incident.environment}
            label={translateEnvironments(incident.environment)}
          />
          <VisibilityBadge
            visibility={incident.visibility}
            label={translateVisibilities(incident.visibility)}
          />
          <span className="text-meta text-fg-secondary">
            {incident.commanderName === null
              ? translateHeader('noCommander')
              : translateHeader('commander', { name: incident.commanderName })}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        {incident.impact.moneyAtRisk === null ? null : (
          <HeaderFigure
            value={format.money(incident.impact.moneyAtRisk)}
            label={translateHeader('moneyAtRisk')}
          />
        )}
        {incident.impact.failedTransactions === null ? null : (
          <HeaderFigure
            value={format.compactCount(incident.impact.failedTransactions)}
            label={translateHeader('failedTransactions')}
          />
        )}
        {currentTime === null ? null : (
          <HeaderFigure
            value={format.duration(currentTime.getTime() - Date.parse(incident.impactStartedAt))}
            label={translateHeader('incidentAge')}
          />
        )}
        {nearestClock === undefined ? (
          <p className="text-meta text-fg-tertiary">{translateHeader('noClock')}</p>
        ) : (
          <ClockWidget
            size="compact"
            title={nearestClock.obligationName}
            startedAt={new Date(nearestClock.startedAt)}
            deadlineAt={new Date(nearestClock.deadlineAt)}
            phaseLabels={phaseLabels}
            deadlineText={format.timeOfDay(new Date(nearestClock.deadlineAt))}
          />
        )}
        <div className="flex flex-col items-end gap-1">
          {incident.acknowledgement === null ? (
            <Button
              variant="primary"
              onClick={acknowledgeAction.acknowledge}
              isLoading={acknowledgeAction.isAcknowledging}
              disabled={!acknowledgeAction.canAcknowledge}
              aria-keyshortcuts="A"
            >
              {translateHeader('acknowledge')}
            </Button>
          ) : (
            <p className="max-w-56 text-end text-meta text-fg-secondary">
              {translateHeader('acknowledged', {
                name: incident.acknowledgement.acknowledgedByName,
                time: format.timeOfDay(new Date(incident.acknowledgement.acknowledgedAt)),
              })}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
