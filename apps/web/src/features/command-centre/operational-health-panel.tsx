'use client';

import { cn, ConnectorHealthBadge, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import type { LastDaySummary } from '@/features/analytics/model';
import type { ConnectorSummary } from '@/features/integrations/model';
import type { BusinessServiceAtRisk } from '@/features/services/model';
import { businessServiceHealthClassNames } from '@/features/services/service-labels';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { QuerySection } from '@/lib/ui/query-section';

const MAX_LISTED_ITEMS = 3;
const MILLISECONDS_PER_SECOND = 1_000;

const connectorAttentionOrder = { unavailable: 0, degraded: 1, disabled: 2, connected: 3 } as const;

function HealthColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-meta font-semibold text-fg-secondary uppercase">{title}</h3>
      {children}
    </div>
  );
}

function ServicesAtRisk({ query }: { query: UseQueryResult<BusinessServiceAtRisk[]> }) {
  const translateHealth = useTranslations('commandCentre.health');
  const translateServiceHealth = useTranslations('domain.businessServiceHealth');

  return (
    <HealthColumn title={translateHealth('servicesAtRisk')}>
      <QuerySection
        query={query}
        sectionName={translateHealth('servicesAtRisk')}
        loadingPlaceholder={<Skeleton className="h-24 w-full" />}
      >
        {(services) =>
          services.length === 0 ? (
            <p className="text-body text-fg-secondary">{translateHealth('noServicesAtRisk')}</p>
          ) : (
            <>
              <p className="flex items-baseline gap-3">
                <span className="text-metric font-semibold tabular-nums">{services.length}</span>
                <span className="text-table text-fg-secondary">
                  {translateHealth('businessServicesAtRisk', { count: services.length })}
                </span>
              </p>
              <ul className="flex flex-col gap-2">
                {services.slice(0, MAX_LISTED_ITEMS).map((service) => {
                  const healthClassNames = businessServiceHealthClassNames[service.health];
                  return (
                    <li
                      key={service.id}
                      className="flex items-center justify-between gap-3 text-table"
                    >
                      <span className="flex min-w-0 items-center gap-2 font-semibold">
                        <span
                          aria-hidden
                          className={cn('size-2 shrink-0 rounded-full', healthClassNames.dot)}
                        />
                        <span className="truncate">{service.name}</span>
                      </span>
                      <span className={cn('shrink-0 font-semibold', healthClassNames.text)}>
                        {translateServiceHealth(service.health)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )
        }
      </QuerySection>
    </HealthColumn>
  );
}

function ConnectorHealth({ query }: { query: UseQueryResult<ConnectorSummary[]> }) {
  const translateHealth = useTranslations('commandCentre.health');
  const translateConnectorHealth = useTranslations('domain.connectorHealth');

  return (
    <HealthColumn title={translateHealth('connectors')}>
      <QuerySection
        query={query}
        sectionName={translateHealth('connectors')}
        loadingPlaceholder={<Skeleton className="h-24 w-full" />}
      >
        {(connectors) => {
          if (connectors.length === 0) {
            return <p className="text-body text-fg-secondary">{translateHealth('noConnectors')}</p>;
          }
          const healthyCount = connectors.filter(
            (connector) => connector.health === 'connected',
          ).length;
          // Problems first, so a degraded source is never pushed out of view.
          const listedConnectors = [...connectors]
            .sort(
              (first, second) =>
                connectorAttentionOrder[first.health] - connectorAttentionOrder[second.health],
            )
            .slice(0, MAX_LISTED_ITEMS);
          return (
            <>
              <p className="text-panel-title font-semibold tabular-nums">
                {translateHealth('connectorsHealthy', {
                  healthy: healthyCount,
                  total: connectors.length,
                })}
              </p>
              <ul className="flex flex-col gap-2">
                {listedConnectors.map((connector) => (
                  <li
                    key={connector.id}
                    className="flex items-center justify-between gap-3 text-table"
                  >
                    <span className="truncate font-semibold">{connector.name}</span>
                    <ConnectorHealthBadge
                      health={connector.health}
                      label={translateConnectorHealth(connector.health)}
                    />
                  </li>
                ))}
              </ul>
            </>
          );
        }}
      </QuerySection>
    </HealthColumn>
  );
}

function LastDay({ query }: { query: UseQueryResult<LastDaySummary> }) {
  const translateHealth = useTranslations('commandCentre.health');
  const format = useRelyxusFormat();

  return (
    <HealthColumn title={translateHealth('lastDay')}>
      <QuerySection
        query={query}
        sectionName={translateHealth('lastDay')}
        loadingPlaceholder={<Skeleton className="h-24 w-full" />}
      >
        {(summary) => (
          <div className="flex flex-col gap-3">
            <p className="text-panel-title font-semibold">
              {translateHealth('incidentCount', { count: summary.incidentCount })}
            </p>
            <dl className="flex flex-col gap-0.5">
              <dt className="text-table text-fg-secondary">
                {translateHealth('medianTimeToFirstHypothesis')}
              </dt>
              <dd className="text-metric font-semibold tabular-nums">
                {summary.medianTimeToFirstHypothesisSeconds === null
                  ? translateHealth('noHypothesisYet')
                  : format.duration(
                      summary.medianTimeToFirstHypothesisSeconds * MILLISECONDS_PER_SECOND,
                      { includeSeconds: true },
                    )}
              </dd>
            </dl>
            <p className="text-table text-fg-secondary">
              {translateHealth('resolvedWithoutRollback', {
                count: summary.resolvedWithoutRollbackCount,
              })}
            </p>
            <p
              className={cn(
                'text-table font-semibold',
                summary.unapprovedProductionChangeCount === 0 ? 'text-healthy' : 'text-critical',
              )}
            >
              {translateHealth('unapprovedProductionChanges', {
                count: summary.unapprovedProductionChangeCount,
              })}
            </p>
          </div>
        )}
      </QuerySection>
    </HealthColumn>
  );
}

export function OperationalHealthPanel({
  servicesQuery,
  connectorsQuery,
  lastDayQuery,
}: {
  servicesQuery: UseQueryResult<BusinessServiceAtRisk[]>;
  connectorsQuery: UseQueryResult<ConnectorSummary[]>;
  lastDayQuery: UseQueryResult<LastDaySummary>;
}) {
  const translateHealth = useTranslations('commandCentre.health');

  return (
    <section aria-labelledby="operational-health-heading" className="flex flex-col gap-3">
      <h2 id="operational-health-heading" className="text-section-title font-semibold">
        {translateHealth('heading')}
      </h2>
      <div className="grid gap-6 rounded-panel border border-control bg-surface-1 p-5 laptop:grid-cols-3 laptop:divide-x laptop:divide-divider rtl:laptop:divide-x-reverse [&>*]:laptop:px-5 [&>*:first-child]:laptop:ps-0 [&>*:last-child]:laptop:pe-0">
        <ServicesAtRisk query={servicesQuery} />
        <ConnectorHealth query={connectorsQuery} />
        <LastDay query={lastDayQuery} />
      </div>
    </section>
  );
}
