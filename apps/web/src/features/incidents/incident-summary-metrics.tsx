'use client';

import { MetricCard } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { QuerySection } from '@/lib/ui/query-section';

import type { IncidentListSummary } from './model';

export function IncidentSummaryMetrics({ query }: { query: UseQueryResult<IncidentListSummary> }) {
  const translateMetrics = useTranslations('incidents.list.metrics');

  return (
    <QuerySection
      query={query}
      sectionName={translateMetrics('sectionName')}
      loadingPlaceholder={
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <MetricCard
              key={index}
              label="…"
              value={null}
              noDataLabel="…"
              isLoading
            />
          ))}
        </div>
      }
    >
      {(summary) => (
        <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-5">
          <MetricCard
            label={translateMetrics('sev1')}
            value={summary.activeBySeverity.SEV1}
            noDataLabel={translateMetrics('noData')}
            caption={translateMetrics('activeNow')}
            tone="critical"
          />
          <MetricCard
            label={translateMetrics('sev2')}
            value={summary.activeBySeverity.SEV2}
            noDataLabel={translateMetrics('noData')}
            caption={translateMetrics('activeNow')}
            tone="major"
          />
          <MetricCard
            label={translateMetrics('investigating')}
            value={summary.activeInvestigatingCount}
            noDataLabel={translateMetrics('noData')}
            caption={translateMetrics('allSeverity')}
          />
          <MetricCard
            label={translateMetrics('monitoring')}
            value={summary.activeMonitoringCount}
            noDataLabel={translateMetrics('noData')}
            caption={translateMetrics('waitingForStability')}
          />
          <MetricCard
            label={translateMetrics('resolved24h')}
            value={summary.resolvedLast24Hours}
            noDataLabel={translateMetrics('noData')}
            caption={translateMetrics('last24Hours')}
            tone="healthy"
          />
        </div>
      )}
    </QuerySection>
  );
}
