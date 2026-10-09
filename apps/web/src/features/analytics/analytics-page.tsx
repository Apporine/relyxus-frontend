'use client';

import { MetricCard, Skeleton } from '@relyxus/ui';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';

import { incidentListHref } from '@/features/incidents/incident-list-params';
import { EChart, type ChartColors } from '@/lib/charts/echart';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { formattingLocaleFor } from '@/lib/i18n/locales';
import { DataTable } from '@/lib/ui/data-table';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';
import { RankedBars } from '@/lib/ui/ranked-bars';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import type { MetricUnit, ReliabilityAnalytics } from './model';
import { buildMttrTrendOption } from './mttr-chart-option';
import { useReliabilityAnalytics } from './queries';

const MILLISECONDS_PER_SECOND = 1_000;
const MILLISECONDS_PER_MINUTE = 60_000;

type DrillDown = ReliabilityAnalytics['drillDowns'][number];

/** Relative change from the prior period, or null when there is no prior value to compare. */
export function relativeChange(current: number, prior: number): number | null {
  if (prior === 0) {
    return current === 0 ? 0 : null;
  }
  return (current - prior) / prior;
}

function useMetricValueFormatter() {
  const format = useRelyxusFormat();
  return (value: number, unit: MetricUnit) => {
    if (unit === 'minutes') {
      return format.duration(value * MILLISECONDS_PER_MINUTE);
    }
    if (unit === 'seconds') {
      return format.duration(value * MILLISECONDS_PER_SECOND, { includeSeconds: true });
    }
    return String(value);
  };
}

function ReliabilityMetrics({ analytics }: { analytics: ReliabilityAnalytics }) {
  const translateMetrics = useTranslations('analytics.metrics');
  const translateConfidence = useTranslations('domain.impactConfidence');
  const format = useRelyxusFormat();
  const mttrChange = analytics.mttrMinutes.current - analytics.mttrMinutes.prior;

  return (
    <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-4">
      <MetricCard
        label={translateMetrics('mttr')}
        value={format.duration(analytics.mttrMinutes.current * MILLISECONDS_PER_MINUTE)}
        noDataLabel={translateMetrics('noData')}
        caption={translateMetrics(mttrChange <= 0 ? 'mttrDown' : 'mttrUp', {
          change: format.duration(Math.abs(mttrChange) * MILLISECONDS_PER_MINUTE),
        })}
      />
      <MetricCard
        label={translateMetrics('incidents')}
        value={String(analytics.incidentCount)}
        noDataLabel={translateMetrics('noData')}
        caption={translateMetrics('window', { days: analytics.windowDays })}
      />
      <MetricCard
        label={translateMetrics('downtimeAvoided')}
        value={format.duration(analytics.downtimeAvoided.minutes * MILLISECONDS_PER_MINUTE)}
        noDataLabel={translateMetrics('noData')}
        caption={translateMetrics(analytics.downtimeAvoided.isVerified ? 'verified' : 'unverified')}
      />
      <MetricCard
        label={translateMetrics('customerImpact')}
        value={format.money(analytics.customerImpact)}
        noDataLabel={translateMetrics('noData')}
        caption={translateMetrics('atRisk', {
          confidence: translateConfidence(analytics.customerImpact.confidence),
        })}
      />
    </div>
  );
}

function MttrTrendPanel({ analytics }: { analytics: ReliabilityAnalytics }) {
  const translateTrend = useTranslations('analytics.trend');
  const locale = useLocale();
  const points = useMemo(() => {
    const dateFormat = new Intl.DateTimeFormat(formattingLocaleFor(locale), {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
    return analytics.mttrTrend.map((point) => ({
      periodLabel: dateFormat.format(new Date(point.periodStart)),
      mttrMinutes: point.mttrMinutes,
    }));
  }, [analytics.mttrTrend, locale]);
  const seriesName = translateTrend('series');
  const buildOption = useCallback(
    (colors: ChartColors) => buildMttrTrendOption(points, colors, seriesName),
    [points, seriesName],
  );

  return (
    <Panel title={translateTrend('title')}>
      <p className="-mt-2 text-meta text-fg-secondary">
        {translateTrend('definition', { version: analytics.metricDefinitionVersion })}
      </p>
      <EChart buildOption={buildOption} label={translateTrend('chartLabel')} className="h-56" />
      <details className="text-table">
        <summary className="cursor-pointer font-semibold text-fg-secondary">
          {translateTrend('viewAsTable')}
        </summary>
        <ul className="mt-2 flex flex-col gap-1 tabular-nums">
          {points.map((point) => (
            <li key={point.periodLabel}>
              {translateTrend('point', { period: point.periodLabel, minutes: point.mttrMinutes })}
            </li>
          ))}
        </ul>
      </details>
    </Panel>
  );
}

function DrillDownTable({ drillDowns }: { drillDowns: readonly DrillDown[] }) {
  const translateDrillDowns = useTranslations('analytics.drillDowns');
  const formatMetricValue = useMetricValueFormatter();
  const percentFormat = new Intl.NumberFormat(formattingLocaleFor(useLocale()), {
    style: 'percent',
    signDisplay: 'exceptZero',
    maximumFractionDigits: 1,
  });

  return (
    <DataTable
      caption={translateDrillDowns('caption')}
      rows={drillDowns}
      getRowKey={(drillDown) => drillDown.metric}
      emptyText={translateDrillDowns('empty')}
      columns={[
        {
          key: 'metric',
          header: translateDrillDowns('columns.metric'),
          isRowHeader: true,
          render: (drillDown) => translateDrillDowns(`metrics.${drillDown.metric}`),
        },
        {
          key: 'current',
          header: translateDrillDowns('columns.current'),
          className: 'tabular-nums',
          render: (drillDown) => formatMetricValue(drillDown.current, drillDown.unit),
        },
        {
          key: 'prior',
          header: translateDrillDowns('columns.prior'),
          className: 'tabular-nums',
          render: (drillDown) => formatMetricValue(drillDown.prior, drillDown.unit),
        },
        {
          key: 'change',
          header: translateDrillDowns('columns.change'),
          className: 'tabular-nums',
          render: (drillDown) => {
            const change = relativeChange(drillDown.current, drillDown.prior);
            return change === null ? translateDrillDowns('noPrior') : percentFormat.format(change);
          },
        },
        {
          key: 'source',
          header: translateDrillDowns('columns.source'),
          render: (drillDown) => drillDown.source,
        },
      ]}
    />
  );
}

/** Analytics (UI/UX s. 12.7, Figma frame 22): reliability, impact and automation over time. */
export function AnalyticsPage() {
  const translateAnalytics = useTranslations('analytics');
  const { workspace } = useCurrentWorkspace();
  const analyticsQuery = useReliabilityAnalytics(workspace.slug);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateAnalytics('title')}
        description={translateAnalytics('description')}
        actions={
          <UnavailableAction
            label={translateAnalytics('scheduleReport')}
            reason={translateAnalytics('scheduleReportUnavailable')}
          />
        }
      />
      <QuerySection
        query={analyticsQuery}
        sectionName={translateAnalytics('title')}
        loadingPlaceholder={<Skeleton className="h-[40rem] w-full" />}
      >
        {(analytics) => (
          <>
            <ReliabilityMetrics analytics={analytics} />
            <div className="grid gap-6 laptop:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
              <MttrTrendPanel analytics={analytics} />
              <Panel title={translateAnalytics('byService.title')}>
                <p className="-mt-2 text-meta text-fg-secondary">
                  {translateAnalytics('byService.description')}
                </p>
                <RankedBars
                  emptyText={translateAnalytics('byService.empty')}
                  items={analytics.incidentsByBusinessService.map((service) => ({
                    key: service.id,
                    label: service.name,
                    count: service.count,
                    href: incidentListHref(workspace.slug, {
                      status: 'all',
                      severities: [],
                      businessServiceId: service.id,
                    }),
                  }))}
                />
              </Panel>
            </div>
            <Panel title={translateAnalytics('drillDowns.title')}>
              <p className="-mt-2 text-meta text-fg-secondary">
                {translateAnalytics('drillDowns.description')}
              </p>
              <DrillDownTable drillDowns={analytics.drillDowns} />
            </Panel>
          </>
        )}
      </QuerySection>
    </div>
  );
}
