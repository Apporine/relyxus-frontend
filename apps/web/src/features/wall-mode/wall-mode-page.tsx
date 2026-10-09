'use client';

import { cn, SeverityBadge, useCurrentTime } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { RegulatorClock } from '@/features/compliance/model';
import {
  regulatorClockEvents,
  complianceQueryKeys,
  useActiveRegulatorClocks,
} from '@/features/compliance/queries';
import type { IncidentSummary } from '@/features/incidents/model';
import { incidentListEvents, useActiveIncidents } from '@/features/incidents/queries';
import { connectorHealthEvents, useConnectorHealth } from '@/features/integrations/queries';
import {
  businessServiceHealthEvents,
  useBusinessServicesAtRisk,
} from '@/features/services/queries';
import { BusinessServiceHealthLabel } from '@/features/services/service-labels';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { useLiveConnectionStatus } from '@/lib/live/live-updates-provider';
import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

const CLOCK_REFRESH_MS = 1_000;

/** Wall mode shows only what every viewer in the room may see (UI/UX s. 15). */
export function wallVisibleIncidents(incidents: readonly IncidentSummary[]): IncidentSummary[] {
  return incidents.filter((incident) => incident.visibility === 'workspace');
}

function WallSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-section-title font-semibold text-fg-secondary uppercase">{title}</h2>
      {children}
    </section>
  );
}

function WallQueryContent<Data>({
  query,
  children,
}: {
  query: UseQueryResult<Data>;
  children: (data: Data) => ReactNode;
}) {
  const translateWall = useTranslations('wallMode');
  if (query.isPending) {
    return <p className="text-panel-title text-fg-tertiary">{translateWall('loading')}</p>;
  }
  if (query.isError) {
    return <p className="text-panel-title text-warning">{translateWall('unavailable')}</p>;
  }
  return children(query.data);
}

function IncidentTile({
  incident,
  clock,
}: {
  incident: IncidentSummary;
  clock: RegulatorClock | undefined;
}) {
  const translateWall = useTranslations('wallMode');
  const translateStates = useTranslations('domain.incidentStates');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(CLOCK_REFRESH_MS);
  const moneyAtRisk = incident.impact.moneyAtRisk;

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-panel border bg-surface-1 p-6',
        incident.severity === 'SEV1' ? 'border-critical' : 'border-control',
      )}
    >
      <SeverityBadge severity={incident.severity} className="self-start" />
      <p className="text-section-title font-semibold text-fg-primary">{incident.title}</p>
      <p className="text-panel-title text-fg-secondary">
        {moneyAtRisk === null
          ? translateStates(incident.state)
          : translateWall('moneyAtRisk', { amount: format.money(moneyAtRisk) })}
      </p>
      <p className="text-panel-title font-semibold text-warning tabular-nums">
        {clock === undefined || currentTime === null
          ? translateStates(incident.state)
          : translateWall('clock', {
              remaining: format.duration(Date.parse(clock.deadlineAt) - currentTime.getTime()),
              obligation: clock.obligationName,
            })}
      </p>
    </li>
  );
}

/** Wall mode (UI/UX s. 15, Figma frame 40): a read-only operations view for a shared screen. */
export function WallModePage() {
  const translateWall = useTranslations('wallMode');
  const format = useRelyxusFormat();
  const currentTime = useCurrentTime(CLOCK_REFRESH_MS);
  const { workspace } = useCurrentWorkspace();
  const connection = useLiveConnectionStatus();
  const incidentsQuery = useActiveIncidents(workspace.slug);
  const servicesQuery = useBusinessServicesAtRisk(workspace.slug);
  const connectorsQuery = useConnectorHealth(workspace.slug);
  const clocksQuery = useActiveRegulatorClocks(workspace.slug);
  useRefreshOnLiveEvents(incidentListEvents, ['workspaces', workspace.slug, 'incidents']);
  useRefreshOnLiveEvents(businessServiceHealthEvents, [
    'workspaces',
    workspace.slug,
    'business-services',
  ]);
  useRefreshOnLiveEvents(connectorHealthEvents, ['workspaces', workspace.slug, 'connectors']);
  useRefreshOnLiveEvents(regulatorClockEvents, complianceQueryKeys.activeClocks(workspace.slug));

  return (
    <main className="flex min-h-dvh flex-col gap-10 bg-canvas p-10 text-fg-primary">
      <header className="flex items-baseline justify-between gap-6">
        <h1 className="text-page-title font-semibold">{translateWall('title')}</h1>
        <p
          className={cn(
            'text-panel-title font-semibold tabular-nums',
            connection.state === 'open' ? 'text-healthy' : 'text-warning',
          )}
        >
          {translateWall(connection.state === 'open' ? 'live' : 'reconnecting', {
            time: currentTime === null ? '--:--' : format.timeOfDay(currentTime),
          })}
        </p>
      </header>

      <WallSection title={translateWall('activeIncidents')}>
        <WallQueryContent query={incidentsQuery}>
          {(incidents) => {
            const visibleIncidents = wallVisibleIncidents(incidents);
            return visibleIncidents.length === 0 ? (
              <p className="text-section-title text-healthy">{translateWall('noIncidents')}</p>
            ) : (
              <ul className="grid gap-6 laptop:grid-cols-3">
                {visibleIncidents.map((incident) => (
                  <IncidentTile
                    key={incident.reference}
                    incident={incident}
                    clock={
                      clocksQuery.data
                        ?.filter(
                          (clock) =>
                            clock.incidentReference === incident.reference && !clock.isSubmitted,
                        )
                        .toSorted(
                          (first, second) =>
                            Date.parse(first.deadlineAt) - Date.parse(second.deadlineAt),
                        )[0]
                    }
                  />
                ))}
              </ul>
            );
          }}
        </WallQueryContent>
        <p className="text-body text-fg-tertiary">{translateWall('restrictedNote')}</p>
      </WallSection>

      <div className="grid gap-10 laptop:grid-cols-2">
        <WallSection title={translateWall('servicesAtRisk')}>
          <WallQueryContent query={servicesQuery}>
            {(services) =>
              services.length === 0 ? (
                <p className="text-panel-title text-healthy">{translateWall('noServicesAtRisk')}</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {services.map((service) => (
                    <li
                      key={service.id}
                      className="flex items-center justify-between gap-4 text-panel-title"
                    >
                      <span className="font-semibold">{service.name}</span>
                      <BusinessServiceHealthLabel
                        health={service.health}
                        className="text-panel-title"
                      />
                    </li>
                  ))}
                </ul>
              )
            }
          </WallQueryContent>
        </WallSection>
        <WallSection title={translateWall('platformHealth')}>
          <WallQueryContent query={connectorsQuery}>
            {(connectors) => {
              const healthyCount = connectors.filter(
                (connector) => connector.health === 'connected',
              ).length;
              return (
                <p
                  className={cn(
                    'text-section-title font-semibold',
                    healthyCount === connectors.length ? 'text-healthy' : 'text-warning',
                  )}
                >
                  {translateWall('connectorsHealthy', {
                    healthy: healthyCount,
                    total: connectors.length,
                  })}
                </p>
              );
            }}
          </WallQueryContent>
        </WallSection>
      </div>

      <footer className="mt-auto text-body text-fg-tertiary">{translateWall('footer')}</footer>
    </main>
  );
}
