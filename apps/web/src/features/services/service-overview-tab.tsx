'use client';

import { EnvironmentBadge } from '@relyxus/ui';
import { useLocale, useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { formattingLocaleFor } from '@/lib/i18n/locales';

import type { ServiceDetail } from './model';

export function ServiceFacts({ facts }: { facts: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-2">
      {facts.map((fact) => (
        <div key={fact.label} className="contents">
          <dt className="text-meta font-semibold text-fg-tertiary uppercase">{fact.label}</dt>
          <dd className="text-table text-fg-primary">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ServiceTabSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h4 className="text-meta font-semibold text-fg-secondary uppercase">{title}</h4>
      {children}
    </section>
  );
}

function SourceConflicts({ service }: { service: ServiceDetail }) {
  const translateOverview = useTranslations('services.overview');
  const translateSources = useTranslations('services.sources');
  const translateFields = useTranslations('services.conflictFields');

  return (
    <ServiceTabSection title={translateOverview('conflicts')}>
      <p className="text-meta text-fg-secondary">{translateOverview('conflictsDescription')}</p>
      <ul className="flex flex-col gap-3">
        {service.conflicts.map((conflict) => (
          <li
            key={conflict.field}
            className="flex flex-col gap-2 rounded-panel border border-warning bg-warning-subtle p-3"
          >
            <p className="text-table font-semibold">{translateFields(conflict.field)}</p>
            <ul className="flex flex-col gap-1">
              {conflict.values.map((sourceValue) => (
                <li key={sourceValue.source} className="flex flex-wrap gap-x-2 text-table">
                  <span className="text-fg-secondary">{translateSources(sourceValue.source)}</span>
                  <span className="font-semibold">{sourceValue.value}</span>
                  {sourceValue.source === conflict.appliedSource ? (
                    <span className="text-meta font-semibold text-healthy">
                      {translateOverview('applied')}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </ServiceTabSection>
  );
}

/** Overview tab: what the service is, where it runs and which sources describe it. */
export function ServiceOverviewTab({ service }: { service: ServiceDetail }) {
  const translateOverview = useTranslations('services.overview');
  const translateTiers = useTranslations('services.tiers');
  const translateLifecycle = useTranslations('services.lifecycle');
  const translateSources = useTranslations('services.sources');
  const translateEnvironments = useTranslations('domain.environments');
  const format = useRelyxusFormat();
  const listFormat = new Intl.ListFormat(formattingLocaleFor(useLocale()), {
    type: 'conjunction',
  });

  return (
    <div className="flex flex-col gap-6">
      {service.description === null ? null : (
        <p className="text-body text-fg-secondary">{service.description}</p>
      )}
      <ServiceFacts
        facts={[
          { label: translateOverview('tier'), value: translateTiers(service.tier) },
          { label: translateOverview('lifecycle'), value: translateLifecycle(service.lifecycle) },
          {
            label: translateOverview('environments'),
            value: (
              <span className="flex flex-wrap gap-1.5">
                {service.environments.map((environment) => (
                  <EnvironmentBadge
                    key={environment}
                    environment={environment}
                    label={translateEnvironments(environment)}
                  />
                ))}
              </span>
            ),
          },
          {
            label: translateOverview('businessServices'),
            value:
              service.businessServices.length === 0
                ? translateOverview('noBusinessServices')
                : listFormat.format(
                    service.businessServices.map((businessService) => businessService.name),
                  ),
          },
          {
            label: translateOverview('owner'),
            value: service.owner?.teamName ?? translateOverview('noOwner'),
          },
        ]}
      />

      {service.conflicts.length === 0 ? null : <SourceConflicts service={service} />}

      <ServiceTabSection title={translateOverview('sourceRecords')}>
        {service.sourceRecords.length === 0 ? (
          <p className="text-body text-fg-secondary">{translateOverview('noSourceRecords')}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {service.sourceRecords.map((record) => (
              <li
                key={record.source}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-divider pb-2 text-table"
              >
                <span className="font-semibold">{translateSources(record.source)}</span>
                <span dir="ltr" className="font-mono text-fg-secondary">
                  {record.externalId}
                </span>
                <span className="text-meta text-fg-tertiary">
                  {translateOverview('lastSynced', {
                    time: format.dateAndTime(new Date(record.lastSyncedAt)),
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ServiceTabSection>
    </div>
  );
}

/** Owners tab: who owns the service, whether that is confirmed, and where work goes if not. */
export function ServiceOwnersTab({ service }: { service: ServiceDetail }) {
  const translateOwners = useTranslations('services.owners');
  const format = useRelyxusFormat();

  if (service.owner === null) {
    return (
      <p className="rounded-panel border border-warning bg-warning-subtle px-3 py-2 text-table">
        {translateOwners('noOwner', { team: service.fallbackTeamName })}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {service.owner.isConfirmationOverdue ? (
        <p className="rounded-panel border border-warning bg-warning-subtle px-3 py-2 text-table">
          {translateOwners('confirmationOverdue', { team: service.owner.teamName })}
        </p>
      ) : null}
      <ServiceFacts
        facts={[
          { label: translateOwners('team'), value: service.owner.teamName },
          {
            label: translateOwners('confirmed'),
            value:
              service.ownerConfirmedAt === null
                ? translateOwners('neverConfirmed')
                : format.dateAndTime(new Date(service.ownerConfirmedAt)),
          },
          {
            label: translateOwners('onCallSchedule'),
            value: service.onCallScheduleName ?? translateOwners('noOnCallSchedule'),
          },
        ]}
      />
    </div>
  );
}
