'use client';

import { Button, cn, EmptyState, Input, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';

import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

import type { ServiceSummary } from './model';
import { servicesHref, type ServiceDetailTab } from './service-params';
import { ServiceAttentionMarkers, ServiceHealthLabel } from './service-labels';

/** Waits for a pause in typing so each keystroke does not start a new search. */
const SEARCH_DEBOUNCE_MS = 300;

type ServiceListPanelProps = {
  workspaceSlug: string;
  query: UseQueryResult<ServiceSummary[]>;
  selectedServiceId: string | null;
  selectedTab: ServiceDetailTab;
  searchText: string;
  onSearchTextChange: (searchText: string) => void;
};

function ServiceSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const translateList = useTranslations('services.list');
  const inputId = useId();

  return (
    <div role="search" className="relative">
      <label htmlFor={inputId} className="sr-only">
        {translateList('searchLabel')}
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-fg-tertiary"
      />
      <Input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={translateList('searchPlaceholder')}
        className="ps-9"
        autoComplete="off"
      />
    </div>
  );
}

/** Left column (UI/UX s. 13.2): the searchable technical inventory. */
export function ServiceListPanel({
  workspaceSlug,
  query,
  selectedServiceId,
  selectedTab,
  searchText,
  onSearchTextChange,
}: ServiceListPanelProps) {
  const translateList = useTranslations('services.list');
  const translateTiers = useTranslations('services.tiers');
  const [draftSearchText, setDraftSearchText] = useState(searchText);

  useEffect(() => {
    const trimmedSearchText = draftSearchText.trim();
    if (trimmedSearchText === searchText) {
      return;
    }
    const timer = setTimeout(() => onSearchTextChange(trimmedSearchText), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draftSearchText, onSearchTextChange, searchText]);

  function clearSearch() {
    setDraftSearchText('');
    onSearchTextChange('');
  }

  return (
    <Panel title={translateList('title')}>
      <p className="-mt-2 text-meta text-fg-secondary">{translateList('description')}</p>
      <ServiceSearchField value={draftSearchText} onChange={setDraftSearchText} />
      <QuerySection
        query={query}
        sectionName={translateList('title')}
        loadingPlaceholder={<Skeleton className="h-96 w-full" />}
      >
        {(services) =>
          services.length === 0 ? (
            searchText === '' ? (
              <EmptyState
                kind="first-use"
                headingLevel={3}
                title={translateList('emptyTitle')}
                description={translateList('emptyDescription')}
              />
            ) : (
              <EmptyState
                kind="filtered"
                headingLevel={3}
                title={translateList('noMatchesTitle', { searchText })}
                description={translateList('noMatchesDescription')}
                action={
                  <Button size="small" onClick={clearSearch}>
                    {translateList('clearSearch')}
                  </Button>
                }
              />
            )
          ) : (
            <ul
              aria-label={translateList('resultsLabel', { count: services.length })}
              aria-busy={query.isPlaceholderData || undefined}
              className={cn('flex flex-col gap-2', query.isPlaceholderData && 'opacity-60')}
            >
              {services.map((service) => {
                const isSelected = service.id === selectedServiceId;
                return (
                  <li key={service.id}>
                    <Link
                      href={servicesHref(workspaceSlug, {
                        serviceId: service.id,
                        tab: selectedTab,
                        searchText,
                      })}
                      replace
                      scroll={false}
                      aria-current={isSelected ? 'true' : undefined}
                      className={cn(
                        'flex flex-col gap-1.5 rounded-panel border p-3 transition-colors hover:bg-surface-2',
                        isSelected ? 'border-strong bg-selected' : 'border-divider',
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-body font-semibold text-fg-primary">
                          {service.name}
                        </span>
                        <ServiceHealthLabel health={service.health} />
                      </span>
                      <span className="text-meta text-fg-secondary">
                        {translateList('tierAndOwner', {
                          tier: translateTiers(service.tier),
                          owner: service.owner?.teamName ?? translateList('noOwner'),
                        })}
                      </span>
                      <ServiceAttentionMarkers service={service} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )
        }
      </QuerySection>
    </Panel>
  );
}
