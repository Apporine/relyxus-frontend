'use client';

import {
  Banner,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EnvironmentBadge,
  useToast,
} from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useState } from 'react';

import { ApiError } from '@/lib/api/api-error';
import { newIdempotencyKey } from '@/lib/api/http-client';
import { formattingLocaleFor } from '@/lib/i18n/locales';

import type { ServiceDependencies, ServiceDetail } from './model';
import { useConfirmService } from './queries';
import { ServiceDetailTabs } from './service-detail-tabs';
import { ServiceHealthLabel } from './service-labels';
import type { ServiceDetailTab } from './service-params';

/** Catalogue changes from UI/UX s. 13.2 whose write contracts are not defined yet (Q18). */
const pendingCatalogueActions = [
  'editMappings',
  'mergeDuplicates',
  'assignOwner',
  'linkBusinessService',
  'setTierAndSlo',
  'retire',
] as const;

function CatalogueActionsMenu() {
  const translateActions = useTranslations('services.catalogueActions');
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
        {pendingCatalogueActions.map((action) => (
          <DropdownMenuItem key={action} disabled>
            {translateActions(action)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** A person confirms a discovered service before it enters the catalogue (Product s. 7). */
function UnconfirmedDiscoveryBanner({
  workspaceSlug,
  service,
  canChangeState,
}: {
  workspaceSlug: string;
  service: ServiceDetail;
  canChangeState: boolean;
}) {
  const translateStates = useTranslations('services.states');
  const translateSources = useTranslations('services.sources');
  const translateCommon = useTranslations('common');
  const { showToast } = useToast();
  const listFormat = new Intl.ListFormat(formattingLocaleFor(useLocale()), {
    type: 'conjunction',
  });
  // One key per confirmation intent, so a retried request can never be applied twice.
  const [idempotencyKey] = useState(newIdempotencyKey);
  const confirmMutation = useConfirmService(workspaceSlug, service.id);
  const reconnectingNoteId = useId();

  // The promise settles even after this banner unmounts, which happens as soon as the
  // refreshed detail shows the service as confirmed; per-call mutate callbacks would not run.
  function confirmService() {
    void confirmMutation.mutateAsync(idempotencyKey).then(
      () =>
        showToast({
          tone: 'success',
          title: translateStates('confirmedToast', { service: service.name }),
        }),
      (error: unknown) =>
        showToast({
          tone: 'error',
          title: translateStates('confirmFailed', { service: service.name }),
          description: translateStates('confirmFailedDetail', {
            reference:
              error instanceof ApiError && error.correlationId !== undefined
                ? error.correlationId
                : translateCommon('notReported'),
          }),
        }),
    );
  }

  return (
    <Banner
      tone="warning"
      title={translateStates('unconfirmedTitle')}
      description={
        <>
          {translateStates('unconfirmedDescription', {
            sources: listFormat.format(
              service.sourceRecords.map((record) => translateSources(record.source)),
            ),
          })}
          {canChangeState ? null : (
            <span id={reconnectingNoteId} className="block">
              {translateStates('confirmWhileReconnecting')}
            </span>
          )}
        </>
      }
      action={
        <Button
          size="small"
          variant="primary"
          onClick={confirmService}
          isLoading={confirmMutation.isPending}
          disabled={!canChangeState}
          aria-describedby={canChangeState ? undefined : reconnectingNoteId}
        >
          {translateStates('confirmService')}
        </Button>
      }
    />
  );
}

function ServiceStateBanners({ service }: { service: ServiceDetail }) {
  const translateStates = useTranslations('services.states');
  return (
    <>
      {service.lifecycle === 'active' ? null : (
        <Banner
          tone="info"
          title={translateStates(`${service.lifecycle}Title`)}
          description={translateStates(`${service.lifecycle}Description`)}
        />
      )}
      {service.isStale ? (
        <Banner
          tone="warning"
          title={translateStates('staleTitle')}
          description={translateStates('staleDescription')}
        />
      ) : null}
    </>
  );
}

type ServiceDetailPanelProps = {
  workspaceSlug: string;
  service: ServiceDetail;
  dependenciesQuery: UseQueryResult<ServiceDependencies>;
  selectedTab: ServiceDetailTab;
  onSelectTab: (tab: string) => void;
  canChangeState: boolean;
};

/** The selected service: identity, catalogue state and the nine detail tabs. */
export function ServiceDetailPanel({
  workspaceSlug,
  service,
  dependenciesQuery,
  selectedTab,
  onSelectTab,
  canChangeState,
}: ServiceDetailPanelProps) {
  const translateTiers = useTranslations('services.tiers');
  const translateEnvironments = useTranslations('domain.environments');
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-panel border border-control bg-surface-1 p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <h2 id={headingId} className="text-section-title font-semibold text-fg-primary">
            {service.name}
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-meta font-semibold text-fg-secondary">
              {translateTiers(service.tier)}
            </span>
            <ServiceHealthLabel health={service.health} />
            {service.environments.map((environment) => (
              <EnvironmentBadge
                key={environment}
                environment={environment}
                label={translateEnvironments(environment)}
              />
            ))}
          </div>
        </div>
        <CatalogueActionsMenu />
      </header>

      {service.discovery === 'unconfirmed' ? (
        <UnconfirmedDiscoveryBanner
          key={service.id}
          workspaceSlug={workspaceSlug}
          service={service}
          canChangeState={canChangeState}
        />
      ) : null}
      <ServiceStateBanners service={service} />

      <ServiceDetailTabs
        workspaceSlug={workspaceSlug}
        service={service}
        dependenciesQuery={dependenciesQuery}
        selectedTab={selectedTab}
        onSelectTab={onSelectTab}
      />
    </section>
  );
}
