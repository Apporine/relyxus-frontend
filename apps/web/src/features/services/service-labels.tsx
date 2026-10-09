'use client';

import { cn } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import type { ServiceHealth, ServiceSummary } from './model';

const serviceHealthClassNames = {
  healthy: { dot: 'bg-healthy', text: 'text-healthy' },
  degraded: { dot: 'bg-warning', text: 'text-warning' },
  'at-risk': { dot: 'bg-critical', text: 'text-critical' },
  outage: { dot: 'bg-critical', text: 'text-critical' },
  unknown: { dot: 'bg-neutral', text: 'text-fg-secondary' },
} satisfies Record<ServiceHealth, { dot: string; text: string }>;

/** Border colour of a map node, paired with the written health word on the node. */
export const serviceHealthBorderClassNames = {
  healthy: 'border-healthy',
  degraded: 'border-warning',
  'at-risk': 'border-critical',
  outage: 'border-critical',
  unknown: 'border-control',
} satisfies Record<ServiceHealth, string>;

/** Health is always written as a word beside its colour (UI/UX s. 6). */
export function ServiceHealthLabel({
  health,
  className,
}: {
  health: ServiceHealth;
  className?: string;
}) {
  const translateHealth = useTranslations('services.health');
  const classNames = serviceHealthClassNames[health];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-meta font-semibold',
        classNames.text,
        className,
      )}
    >
      <span aria-hidden className={cn('size-2 shrink-0 rounded-full', classNames.dot)} />
      {translateHealth(health)}
    </span>
  );
}

/** Catalogue conditions that need a person's attention (UI/UX s. 13.2 states), in display order. */
export const serviceAttentionMarkerKinds = [
  'unconfirmed',
  'conflicting-sources',
  'no-owner',
  'stale-owner',
  'stale',
  'deprecated',
  'retired',
] as const;
export type ServiceAttentionMarker = (typeof serviceAttentionMarkerKinds)[number];

export function serviceAttentionMarkers(service: ServiceSummary): ServiceAttentionMarker[] {
  const markerConditions = {
    unconfirmed: service.discovery === 'unconfirmed',
    'conflicting-sources': service.hasConflictingSources,
    'no-owner': service.owner === null,
    'stale-owner': service.owner?.isConfirmationOverdue === true,
    stale: service.isStale,
    deprecated: service.lifecycle === 'deprecated',
    retired: service.lifecycle === 'retired',
  } satisfies Record<ServiceAttentionMarker, boolean>;
  return serviceAttentionMarkerKinds.filter((marker) => markerConditions[marker]);
}

export function ServiceAttentionMarkers({ service }: { service: ServiceSummary }) {
  const translateMarkers = useTranslations('services.markers');
  const markers = serviceAttentionMarkers(service);
  if (markers.length === 0) {
    return null;
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {markers.map((marker) => (
        <li
          key={marker}
          className="rounded-full border border-warning px-2 text-meta font-semibold text-warning"
        >
          {translateMarkers(marker)}
        </li>
      ))}
    </ul>
  );
}
