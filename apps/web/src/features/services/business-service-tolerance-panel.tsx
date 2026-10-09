'use client';

import {
  Banner,
  Button,
  ClockWidget,
  clockPhases,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SeverityBadge,
  type ClockPhase,
} from '@relyxus/ui';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useId, type ReactNode } from 'react';

import { incidentWarRoomHref } from '@/features/incidents/routes';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { formattingLocaleFor } from '@/lib/i18n/locales';

import { downtimeBudgetRemainingShare, toleranceDeadline } from './business-service-tolerance';
import type { BusinessServiceDetail } from './model';
import { ServiceHealthLabel } from './service-labels';
import { serviceDependenciesHref } from './service-params';

const MILLISECONDS_PER_MINUTE = 60_000;

/** Changes from UI/UX s. 12.5 whose approval flow and contracts are not defined yet (Q19). */
const pendingResilienceActions = [
  'editMapping',
  'editTolerance',
  'configureImpactFormula',
  'startDrill',
] as const;

function ResilienceActionsMenu() {
  const translateActions = useTranslations('businessServices.actions');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="small">
          {translateActions('menu')}
          <ChevronDown aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-72">
        <DropdownMenuLabel>{translateActions('unavailable')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {pendingResilienceActions.map((action) => (
          <DropdownMenuItem key={action} disabled>
            {translateActions(action)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** A labelled figure in the boxed style of Figma frame 20. */
export function ResilienceFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="text-meta font-semibold text-fg-tertiary uppercase">{label}</dt>
      <dd className="rounded-panel border border-control bg-raised px-4 py-3 text-table text-fg-primary">
        {children}
      </dd>
    </div>
  );
}

function ResilienceSection({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h3 id={headingId} className="text-meta font-semibold text-fg-secondary uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function TimeToBreachClock({ businessService }: { businessService: BusinessServiceDetail }) {
  const translateTolerance = useTranslations('businessServices.tolerance');
  const translatePhases = useTranslations('businessServices.tolerancePhases');
  const format = useRelyxusFormat();
  const { tolerance } = businessService;
  const deadline = toleranceDeadline(tolerance);
  const toleranceDuration = format.duration(tolerance.toleranceMinutes * MILLISECONDS_PER_MINUTE);

  if (tolerance.disruptionStartedAt === null || deadline === null) {
    return (
      <p className="rounded-panel border border-control bg-raised px-4 py-3 text-table">
        {translateTolerance('notDisrupted', { tolerance: toleranceDuration })}
      </p>
    );
  }

  const phaseLabels = Object.fromEntries(
    clockPhases.map((phase) => [phase, translatePhases(phase)]),
  ) as Record<ClockPhase, string>;

  return (
    <ClockWidget
      title={translateTolerance('clockTitle', { service: businessService.name })}
      startedAt={new Date(tolerance.disruptionStartedAt)}
      deadlineAt={deadline}
      phaseLabels={phaseLabels}
      deadlineText={translateTolerance('breachAt', {
        time: format.timeOfDay(deadline),
        tolerance: toleranceDuration,
      })}
      details={translateTolerance('disruptedSince', {
        time: format.timeOfDay(new Date(tolerance.disruptionStartedAt)),
      })}
    />
  );
}

function CurrentImpact({ impact }: { impact: BusinessServiceDetail['impact'] }) {
  const translateImpact = useTranslations('businessServices.impact');
  const translateConfidence = useTranslations('domain.impactConfidence');
  const format = useRelyxusFormat();

  if (impact.override !== null) {
    return (
      <div className="flex flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{format.money(impact.override.amount)}</span>
          <span className="rounded-full border border-warning px-2 text-meta font-semibold text-warning">
            {translateImpact('overridden')}
          </span>
        </span>
        <span className="text-meta text-fg-secondary">
          {translateImpact('overrideDetail', {
            name: impact.override.overriddenByName,
            time: format.dateAndTime(new Date(impact.override.overriddenAt)),
            reason: impact.override.reason,
          })}
        </span>
      </div>
    );
  }

  if (impact.current === null) {
    return <span className="text-fg-secondary">{translateImpact('noValue')}</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold">{format.money(impact.current)}</span>
      <span className="text-meta text-fg-secondary">
        {translateImpact('provenance', {
          version: impact.formula.version,
          confidence: translateConfidence(impact.current.confidence),
          source: impact.formula.sourceName,
          time: format.timeOfDay(new Date(impact.current.calculatedAt)),
        })}
      </span>
    </div>
  );
}

function ImpactBanners({ impact }: { impact: BusinessServiceDetail['impact'] }) {
  const translateImpact = useTranslations('businessServices.impact');
  const format = useRelyxusFormat();
  return (
    <>
      {impact.sourceState === 'fresh' ? null : (
        <Banner
          tone="warning"
          title={translateImpact(
            impact.sourceState === 'missing' ? 'sourceMissingTitle' : 'sourceStaleTitle',
          )}
          description={translateImpact(
            impact.sourceState === 'missing'
              ? 'sourceMissingDescription'
              : 'sourceStaleDescription',
            {
              source: impact.formula.sourceName,
              minutes: impact.formula.freshnessLimitMinutes,
              fallback: impact.formula.fallbackAssumption,
            },
          )}
        />
      )}
      {impact.ruleVersionChange === null ? null : (
        <Banner
          tone="info"
          title={translateImpact('ruleChangedTitle', {
            previous: impact.ruleVersionChange.previousVersion,
            current: impact.formula.version,
          })}
          description={translateImpact('ruleChangedDescription', {
            previous: impact.ruleVersionChange.previousVersion,
            time: format.dateAndTime(new Date(impact.ruleVersionChange.changedAt)),
          })}
        />
      )}
    </>
  );
}

function ImpactFormula({ impact }: { impact: BusinessServiceDetail['impact'] }) {
  const translateFormula = useTranslations('businessServices.formula');
  const { formula } = impact;
  const settings = [
    { label: translateFormula('metric'), value: formula.metricName },
    { label: translateFormula('expression'), value: formula.expression },
    { label: translateFormula('source'), value: formula.sourceName },
    { label: translateFormula('currency'), value: formula.currencyCode },
    {
      label: translateFormula('freshnessLimit'),
      value: translateFormula('freshnessMinutes', { minutes: formula.freshnessLimitMinutes }),
    },
    { label: translateFormula('fallback'), value: formula.fallbackAssumption },
  ];

  return (
    <ResilienceSection title={translateFormula('title', { version: formula.version })}>
      <dl className="grid grid-cols-[minmax(8rem,auto)_1fr] gap-x-4 gap-y-2">
        {settings.map((setting) => (
          <div key={setting.label} className="contents">
            <dt className="text-meta font-semibold text-fg-tertiary uppercase">{setting.label}</dt>
            <dd className="text-table text-fg-primary">{setting.value}</dd>
          </div>
        ))}
      </dl>
      {impact.severityThresholds.length === 0 ? null : (
        <ul aria-label={translateFormula('thresholds')} className="flex flex-col gap-2">
          {impact.severityThresholds.map((threshold) => (
            <li key={threshold.severity} className="flex items-center gap-3 text-table">
              <SeverityBadge severity={threshold.severity} />
              {threshold.condition}
            </li>
          ))}
        </ul>
      )}
    </ResilienceSection>
  );
}

function BreachHistory({
  workspaceSlug,
  businessService,
}: {
  workspaceSlug: string;
  businessService: BusinessServiceDetail;
}) {
  const translateHistory = useTranslations('businessServices.breachHistory');
  const format = useRelyxusFormat();

  return (
    <ResilienceSection title={translateHistory('title')}>
      {businessService.breachHistory.length === 0 ? (
        <p className="text-body text-fg-secondary">{translateHistory('empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-divider">
          {businessService.breachHistory.map((breach) => (
            <li
              key={breach.id}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2 text-table first:pt-0"
            >
              <span>
                {translateHistory('entry', {
                  time: format.dateAndTime(new Date(breach.startedAt)),
                  outside: format.duration(
                    breach.minutesOutsideTolerance * MILLISECONDS_PER_MINUTE,
                  ),
                })}
              </span>
              {breach.incidentReference === null ? null : (
                <Link
                  href={incidentWarRoomHref(workspaceSlug, breach.incidentReference)}
                  dir="ltr"
                  className="font-mono text-fg-primary underline-offset-2 hover:underline"
                >
                  {breach.incidentReference}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-meta text-fg-secondary">
        {businessService.lastDrillAt === null
          ? translateHistory('noDrill')
          : translateHistory('lastDrill', {
              time: format.dateAndTime(new Date(businessService.lastDrillAt)),
            })}
      </p>
    </ResilienceSection>
  );
}

/** Centre column of Figma frame 20: time to breach and everything that explains it. */
export function BusinessServiceTolerancePanel({
  workspaceSlug,
  businessService,
}: {
  workspaceSlug: string;
  businessService: BusinessServiceDetail;
}) {
  const translateDetail = useTranslations('businessServices.detail');
  const translateBudget = useTranslations('businessServices.downtimeBudget');
  const format = useRelyxusFormat();
  const listFormat = new Intl.ListFormat(formattingLocaleFor(useLocale()), {
    type: 'conjunction',
  });
  const headingId = useId();
  const { downtimeBudget } = businessService;

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col gap-5 rounded-panel border border-control bg-surface-1 p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <h2 id={headingId} className="text-section-title font-semibold text-fg-primary">
          {businessService.name}
        </h2>
        <ResilienceActionsMenu />
      </header>

      <ImpactBanners impact={businessService.impact} />

      <dl className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <dt className="text-meta font-semibold text-fg-tertiary uppercase">
            {translateDetail('timeToBreach')}
          </dt>
          <dd>
            <TimeToBreachClock businessService={businessService} />
          </dd>
        </div>
        <ResilienceFact label={translateDetail('downtimeBudget')}>
          {translateBudget('remaining', {
            remaining: downtimeBudgetRemainingShare(downtimeBudget),
            period: downtimeBudget.period,
          })}
          <span className="block text-meta text-fg-secondary">
            {translateBudget('used', {
              used: format.duration(downtimeBudget.usedMinutes * MILLISECONDS_PER_MINUTE),
              allowed: format.duration(downtimeBudget.allowedMinutes * MILLISECONDS_PER_MINUTE),
            })}
          </span>
        </ResilienceFact>
        <ResilienceFact label={translateDetail('currentImpact')}>
          <CurrentImpact impact={businessService.impact} />
        </ResilienceFact>
        <ResilienceFact label={translateDetail('technicalDependencies')}>
          {businessService.technicalServices.length === 0 ? (
            translateDetail('noTechnicalServices')
          ) : (
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {businessService.technicalServices.map((technicalService) => (
                <li key={technicalService.id} className="flex items-center gap-2">
                  <Link
                    href={serviceDependenciesHref(workspaceSlug, technicalService.id)}
                    className="font-semibold underline-offset-2 hover:underline"
                  >
                    {technicalService.name}
                  </Link>
                  <ServiceHealthLabel health={technicalService.health} />
                </li>
              ))}
            </ul>
          )}
        </ResilienceFact>
        <ResilienceFact label={translateDetail('regulators')}>
          {businessService.regulators.length === 0
            ? translateDetail('noRegulators')
            : listFormat.format(businessService.regulators)}
        </ResilienceFact>
        <ResilienceFact label={translateDetail('owner')}>
          {businessService.ownerTeamName ?? translateDetail('noOwner')}
        </ResilienceFact>
      </dl>

      <ImpactFormula impact={businessService.impact} />
      <BreachHistory workspaceSlug={workspaceSlug} businessService={businessService} />
    </section>
  );
}
