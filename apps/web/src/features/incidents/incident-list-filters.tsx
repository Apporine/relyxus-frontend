'use client';

import { cn, severityLevels } from '@relyxus/ui';
import type { SeverityLevel } from '@relyxus/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import {
  incidentListHref,
  type IncidentListFilters,
} from '@/features/incidents/incident-list-params';
import type { IncidentViewStatus } from '@/features/incidents/model';

import { incidentListBusinessServices } from './incident-list-services';

type IncidentListFiltersProps = {
  workspaceSlug: string;
  filters: IncidentListFilters;
};

function nextViewStatus(current: IncidentViewStatus): IncidentViewStatus {
  if (current === 'active') {
    return 'resolved';
  }
  if (current === 'resolved') {
    return 'all';
  }
  return 'active';
}

function nextSeverity(current: readonly SeverityLevel[]): readonly SeverityLevel[] {
  if (current.length === 0) {
    return ['SEV1'];
  }
  const currentSeverity = current[0];
  const currentIndex = severityLevels.indexOf(currentSeverity ?? 'SEV1');
  const nextIndex = currentIndex + 1;
  return nextIndex >= severityLevels.length ? [] : [severityLevels[nextIndex] ?? 'SEV1'];
}

function nextServiceId(current: string | null): string | null {
  if (current === null) {
    return incidentListBusinessServices[0]?.id ?? null;
  }
  const currentIndex = incidentListBusinessServices.findIndex((service) => service.id === current);
  if (currentIndex === -1 || currentIndex === incidentListBusinessServices.length - 1) {
    return null;
  }
  return incidentListBusinessServices[currentIndex + 1]?.id ?? null;
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

export function IncidentListFilters({ workspaceSlug, filters }: IncidentListFiltersProps) {
  const translateFilters = useTranslations('incidents.list.filters');

  const viewLabels: Record<IncidentViewStatus, string> = {
    active: translateFilters('viewActive'),
    resolved: translateFilters('viewResolved'),
    all: translateFilters('viewAll'),
  };

  const severityLabel =
    filters.severities.length === 0
      ? translateFilters('severityAll')
      : filters.severities.join(', ');

  const selectedService = incidentListBusinessServices.find(
    (service) => service.id === filters.businessServiceId,
  );
  const serviceLabel = selectedService?.name ?? translateFilters('serviceAll');

  return (
    <div
      role="toolbar"
      aria-label={translateFilters('toolbarLabel')}
      className="flex flex-wrap gap-2 rounded-panel border border-control bg-surface-1 p-4"
    >
      <FilterPill
        label={translateFilters('viewLabel', { view: viewLabels[filters.status] })}
        href={incidentListHref(workspaceSlug, {
          ...filters,
          status: nextViewStatus(filters.status),
        })}
      />
      <FilterPill
        label={translateFilters('severityLabel', { severity: severityLabel })}
        href={incidentListHref(workspaceSlug, {
          ...filters,
          severities: nextSeverity(filters.severities),
        })}
      />
      <FilterPill
        label={translateFilters('serviceLabel', { service: serviceLabel })}
        href={incidentListHref(workspaceSlug, {
          ...filters,
          businessServiceId: nextServiceId(filters.businessServiceId),
        })}
      />
    </div>
  );
}
