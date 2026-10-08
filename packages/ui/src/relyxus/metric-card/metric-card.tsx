import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { Skeleton } from '../../primitives/skeleton/skeleton';

const valueToneClassNames = {
  default: 'text-fg-primary',
  critical: 'text-critical',
  major: 'text-major',
  warning: 'text-warning',
  healthy: 'text-healthy',
} as const;

export type MetricCardTone = keyof typeof valueToneClassNames;

export type MetricCardProps = {
  label: string;
  /** Formatted value, or null when there is no data yet. */
  value: ReactNode | null;
  /** Localised "No data yet" text shown when value is null. */
  noDataLabel: string;
  /** Short context such as "active now" or "last 24 hours". */
  caption?: string;
  /** Use a semantic tone only when the value carries operational meaning. */
  tone?: MetricCardTone;
  isLoading?: boolean;
  className?: string;
};

function MetricValue({
  value,
  noDataLabel,
  tone,
  isLoading,
}: Pick<MetricCardProps, 'value' | 'noDataLabel'> & { tone: MetricCardTone; isLoading: boolean }) {
  if (isLoading) {
    return <Skeleton className="h-(--rx-text-metric-leading) w-16" />;
  }
  if (value === null) {
    return <p className="text-body text-fg-tertiary">{noDataLabel}</p>;
  }
  return (
    <p className={cn('text-metric font-semibold tabular-nums', valueToneClassNames[tone])}>
      {value}
    </p>
  );
}

export function MetricCard({
  label,
  value,
  noDataLabel,
  caption,
  tone = 'default',
  isLoading = false,
  className,
}: MetricCardProps) {
  return (
    <div
      aria-busy={isLoading || undefined}
      className={cn(
        'flex flex-col gap-2 rounded-panel border border-control bg-surface-1 p-4',
        className,
      )}
    >
      <p className="text-meta font-semibold text-fg-secondary uppercase">{label}</p>
      <MetricValue value={value} noDataLabel={noDataLabel} tone={tone} isLoading={isLoading} />
      {caption === undefined ? null : <p className="text-meta text-fg-tertiary">{caption}</p>}
    </div>
  );
}
