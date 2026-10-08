import type { Route } from 'next';

import { incidentEvidenceHref } from '@/features/incidents/routes';

import type { EvidenceListFilters } from './model';
import { evidenceFreshnessFilters } from './model';

export function evidenceFiltersFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): EvidenceListFilters {
  const sourceParam = searchParams.get('source');
  const hypothesisParam = searchParams.get('hypothesis');
  const freshnessParam = searchParams.get('freshness');
  const freshness = evidenceFreshnessFilters.find((value) => value === freshnessParam) ?? 'all';

  return {
    source:
      sourceParam === null || sourceParam === '' || sourceParam === 'all' ? null : sourceParam,
    hypothesisId: hypothesisParam === null || hypothesisParam === '' ? null : hypothesisParam,
    freshness,
  };
}

export function selectedEvidenceIdFromSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
): string | null {
  const item = searchParams.get('item');
  return item === null || item === '' ? null : item;
}

export function evidenceExplorerHref(
  workspaceSlug: string,
  incidentReference: string,
  filters: EvidenceListFilters,
  selectedItemId: string | null,
): Route {
  const parameters = new URLSearchParams();
  if (filters.source !== null) {
    parameters.set('source', filters.source);
  }
  if (filters.hypothesisId !== null) {
    parameters.set('hypothesis', filters.hypothesisId);
  }
  if (filters.freshness !== 'all') {
    parameters.set('freshness', filters.freshness);
  }
  if (selectedItemId !== null) {
    parameters.set('item', selectedItemId);
  }
  const queryString = parameters.toString();
  const base = incidentEvidenceHref(workspaceSlug, incidentReference);
  return `${base}${queryString === '' ? '' : `?${queryString}`}` as Route;
}
