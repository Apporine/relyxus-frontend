'use client';

import { cn } from '@relyxus/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';

import { evidenceExplorerHref } from './evidence-params';
import type { EvidenceListFilters, EvidenceSummary } from './model';

const connectorToneByHealth = {
  connected: 'bg-healthy',
  degraded: 'bg-warning',
  disabled: 'bg-fg-tertiary',
  unavailable: 'bg-critical',
} as const;

function EvidenceListItem({
  item,
  isSelected,
  href,
}: {
  item: EvidenceSummary;
  isSelected: boolean;
  href: Route;
}) {
  const translateIntegrity = useTranslations('evidenceExplorer.integrity');
  const translateFreshness = useTranslations('evidenceExplorer.freshness');
  const format = useRelyxusFormat();
  const connectorTone =
    item.sourceHealth === null ? 'bg-fg-tertiary' : connectorToneByHealth[item.sourceHealth];

  return (
    <Link
      href={href}
      aria-current={isSelected ? 'true' : undefined}
      className={cn(
        'flex flex-col gap-1 rounded-panel border px-4 py-3 transition-colors',
        isSelected
          ? 'border-fg-secondary bg-selected'
          : 'border-control bg-surface-2 hover:bg-selected',
      )}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden className={cn('size-2 rounded-full', connectorTone)} />
        <span className="text-meta font-semibold text-fg-secondary">{item.sourceName}</span>
        <span className="ms-auto text-meta font-semibold text-healthy uppercase">
          {translateIntegrity(item.integrity)}
        </span>
      </div>
      <span className="text-body font-semibold text-fg-primary">{item.title}</span>
      <span className="font-mono text-meta text-fg-tertiary" dir="ltr">
        {format.timeOfDay(new Date(item.capturedAt), { includeSeconds: true })}
        {item.freshness === 'stale' && item.staleDurationSeconds !== null
          ? ` · ${translateFreshness('staleMinutes', { minutes: Math.ceil(item.staleDurationSeconds / 60) })}`
          : null}
      </span>
    </Link>
  );
}

/** Compact evidence cards for the left column (Figma frame 07). */
export function EvidenceListPanel({
  items,
  workspaceSlug,
  incidentReference,
  filters,
  selectedItemId,
}: {
  items: EvidenceSummary[];
  workspaceSlug: string;
  incidentReference: string;
  filters: EvidenceListFilters;
  selectedItemId: string | null;
}) {
  const translateList = useTranslations('evidenceExplorer.list');

  return (
    <section aria-labelledby="evidence-list-heading" className="flex flex-col gap-3">
      <h2
        id="evidence-list-heading"
        className="text-meta font-semibold text-fg-secondary uppercase"
      >
        {translateList('heading')}
      </h2>
      {items.length === 0 ? (
        <p className="text-body text-fg-secondary">{translateList('empty')}</p>
      ) : (
        items.map((item) => (
          <EvidenceListItem
            key={item.id}
            item={item}
            isSelected={item.id === selectedItemId}
            href={evidenceExplorerHref(workspaceSlug, incidentReference, filters, item.id)}
          />
        ))
      )}
    </section>
  );
}
