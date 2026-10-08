'use client';

import { cn } from '@relyxus/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import type { EvidenceFreshnessFilter, EvidenceListFilters } from './model';
import { evidenceExplorerHref } from './evidence-params';
import { evidenceFreshnessFilters } from './model';

type EvidenceFiltersProps = {
  workspaceSlug: string;
  incidentReference: string;
  filters: EvidenceListFilters;
  selectedItemId: string | null;
  sources: readonly string[];
  hypothesisIds: readonly string[];
  hypothesisDisplayName: string | null;
  itemCount: number;
};

function nextHypothesis(current: string | null, hypothesisIds: readonly string[]): string | null {
  if (hypothesisIds.length === 0) {
    return null;
  }
  if (current === null) {
    return hypothesisIds[0] ?? null;
  }
  const currentIndex = hypothesisIds.indexOf(current);
  if (currentIndex === -1 || currentIndex === hypothesisIds.length - 1) {
    return null;
  }
  return hypothesisIds[currentIndex + 1] ?? null;
}

function nextSource(current: string | null, sources: readonly string[]): string | null {
  if (current === null) {
    return sources[0] ?? null;
  }
  const currentIndex = sources.indexOf(current);
  if (currentIndex === -1 || currentIndex === sources.length - 1) {
    return null;
  }
  return sources[currentIndex + 1] ?? null;
}

function nextFreshness(current: EvidenceFreshnessFilter): EvidenceFreshnessFilter {
  const currentIndex = evidenceFreshnessFilters.indexOf(current);
  const nextIndex = currentIndex + 1;
  return evidenceFreshnessFilters[nextIndex] ?? 'all';
}

function FilterPill({ label, href }: { label: string; href: Route }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-7 items-center rounded-full border border-control bg-surface-2 px-3',
        'text-meta font-semibold text-fg-primary hover:bg-selected',
      )}
    >
      {label}
    </Link>
  );
}

/** URL-backed source, hypothesis and freshness filters (Figma frame 07 toolbar). */
export function EvidenceFilters({
  workspaceSlug,
  incidentReference,
  filters,
  selectedItemId,
  sources,
  hypothesisIds,
  hypothesisDisplayName,
  itemCount,
}: EvidenceFiltersProps) {
  const translateFilters = useTranslations('evidenceExplorer.filters');

  const sourceLabel =
    filters.source === null
      ? translateFilters('sourceAll')
      : translateFilters('sourceLabel', { source: filters.source });

  const hypothesisLabel =
    filters.hypothesisId === null
      ? translateFilters('hypothesisAll')
      : translateFilters('hypothesisLabel', {
          hypothesis: hypothesisDisplayName ?? filters.hypothesisId,
        });

  const freshnessLabels: Record<EvidenceFreshnessFilter, string> = {
    all: translateFilters('freshnessAll'),
    fresh: translateFilters('freshnessFresh'),
    stale: translateFilters('freshnessStale'),
  };

  const nextFilters = (patch: Partial<EvidenceListFilters>): EvidenceListFilters => ({
    ...filters,
    ...patch,
  });

  return (
    <div
      role="toolbar"
      aria-label={translateFilters('toolbarLabel')}
      className="flex flex-wrap items-center justify-between gap-3 rounded-panel border border-control bg-surface-1 px-4 py-3"
    >
      <div className="flex flex-wrap gap-2">
        <FilterPill
          label={sourceLabel}
          href={evidenceExplorerHref(
            workspaceSlug,
            incidentReference,
            nextFilters({ source: nextSource(filters.source, sources) }),
            selectedItemId,
          )}
        />
        <FilterPill
          label={hypothesisLabel}
          href={evidenceExplorerHref(
            workspaceSlug,
            incidentReference,
            nextFilters({ hypothesisId: nextHypothesis(filters.hypothesisId, hypothesisIds) }),
            selectedItemId,
          )}
        />
        <FilterPill
          label={freshnessLabels[filters.freshness]}
          href={evidenceExplorerHref(
            workspaceSlug,
            incidentReference,
            nextFilters({ freshness: nextFreshness(filters.freshness) }),
            selectedItemId,
          )}
        />
      </div>
      <p className="text-meta text-fg-secondary">
        {translateFilters('itemCount', { count: itemCount })}
      </p>
    </div>
  );
}
