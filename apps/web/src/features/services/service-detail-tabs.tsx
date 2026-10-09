'use client';

import {
  SeverityBadge,
  Skeleton,
  StateBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { incidentWarRoomHref } from '@/features/incidents/routes';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { QuerySection } from '@/lib/ui/query-section';

import { neighboursByAttention } from './dependency-map-layout';
import type { DependencyNeighbour, ServiceDependencies, ServiceDetail } from './model';
import { ServiceHealthLabel } from './service-labels';
import { ServiceOverviewTab, ServiceOwnersTab, ServiceTabSection } from './service-overview-tab';
import { serviceDetailTabs, servicesHref, type ServiceDetailTab } from './service-params';

/** A list that says what is missing instead of rendering nothing (UI/UX s. 9). */
function TabList<Item>({
  items,
  emptyText,
  renderItem,
}: {
  items: readonly Item[];
  emptyText: string;
  renderItem: (item: Item) => ReactNode;
}) {
  if (items.length === 0) {
    return <p className="text-body text-fg-secondary">{emptyText}</p>;
  }
  return <ul className="flex flex-col divide-y divide-divider">{items.map(renderItem)}</ul>;
}

function TabListRow({ children }: { children: ReactNode }) {
  return <li className="flex flex-col gap-1 py-3 first:pt-0">{children}</li>;
}

function NeighbourList({
  title,
  neighbours,
  emptyText,
  hrefFor,
}: {
  title: string;
  neighbours: readonly DependencyNeighbour[];
  emptyText: string;
  hrefFor: (serviceId: string) => ReturnType<typeof servicesHref>;
}) {
  const translateDependencies = useTranslations('services.dependencies');
  const translateTypes = useTranslations('services.dependencyTypes');
  const translateKinds = useTranslations('services.dependencyKinds');

  return (
    <ServiceTabSection title={title}>
      <TabList
        items={neighboursByAttention(neighbours)}
        emptyText={emptyText}
        renderItem={(neighbour) => (
          <TabListRow key={neighbour.id}>
            <span className="flex items-center justify-between gap-3">
              {neighbour.kind === 'service' ? (
                <Link
                  href={hrefFor(neighbour.id)}
                  replace
                  scroll={false}
                  className="text-table font-semibold text-fg-primary underline-offset-2 hover:underline"
                >
                  {neighbour.name}
                </Link>
              ) : (
                <span className="text-table font-semibold">{neighbour.name}</span>
              )}
              <ServiceHealthLabel health={neighbour.health} />
            </span>
            <span className="text-meta text-fg-secondary">
              {translateDependencies('neighbourDetail', {
                kind: translateKinds(neighbour.kind),
                type: translateTypes(neighbour.dependencyType),
              })}
            </span>
          </TabListRow>
        )}
      />
    </ServiceTabSection>
  );
}

/** Text alternative to the map: every neighbour with its dependency type and health. */
function ServiceDependenciesTab({
  workspaceSlug,
  dependenciesQuery,
}: {
  workspaceSlug: string;
  dependenciesQuery: UseQueryResult<ServiceDependencies>;
}) {
  const translateDependencies = useTranslations('services.dependencies');
  const hrefFor = (serviceId: string) =>
    servicesHref(workspaceSlug, { serviceId, tab: 'dependencies' });

  return (
    <QuerySection
      query={dependenciesQuery}
      sectionName={translateDependencies('sectionName')}
      loadingPlaceholder={<Skeleton className="h-48 w-full" />}
    >
      {(dependencies) => (
        <div className="grid gap-6 laptop:grid-cols-2">
          <NeighbourList
            title={translateDependencies('dependsOn')}
            neighbours={dependencies.dependencies}
            emptyText={translateDependencies('noDependencies')}
            hrefFor={hrefFor}
          />
          <NeighbourList
            title={translateDependencies('dependedOnBy')}
            neighbours={dependencies.dependents}
            emptyText={translateDependencies('noDependents')}
            hrefFor={hrefFor}
          />
        </div>
      )}
    </QuerySection>
  );
}

function ServiceSlosTab({ service }: { service: ServiceDetail }) {
  const translateSlos = useTranslations('services.slos');
  return (
    <TabList
      items={service.slos}
      emptyText={translateSlos('empty')}
      renderItem={(slo) => {
        const isBelowObjective = slo.attainmentPercent < slo.objectivePercent;
        return (
          <TabListRow key={slo.id}>
            <span className="flex items-center justify-between gap-3">
              <span className="text-table font-semibold">{slo.name}</span>
              {isBelowObjective ? (
                <span className="text-meta font-semibold text-critical">
                  {translateSlos('belowObjective')}
                </span>
              ) : null}
            </span>
            <span className="text-meta text-fg-secondary tabular-nums">
              {translateSlos('figures', {
                objective: slo.objectivePercent / 100,
                attainment: slo.attainmentPercent / 100,
                errorBudget: slo.errorBudgetRemainingPercent / 100,
                days: slo.windowDays,
              })}
            </span>
          </TabListRow>
        );
      }}
    />
  );
}

function ServiceIncidentsTab({
  workspaceSlug,
  service,
}: {
  workspaceSlug: string;
  service: ServiceDetail;
}) {
  const translateIncidents = useTranslations('services.incidents');
  const translateStates = useTranslations('domain.incidentStates');
  const format = useRelyxusFormat();
  return (
    <TabList
      items={service.recentIncidents}
      emptyText={translateIncidents('empty')}
      renderItem={(incident) => (
        <TabListRow key={incident.reference}>
          <span className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={incident.severity} />
            <span dir="ltr" className="font-mono text-table text-fg-tertiary">
              {incident.reference}
            </span>
            <Link
              href={incidentWarRoomHref(workspaceSlug, incident.reference)}
              className="text-table font-semibold text-fg-primary underline-offset-2 hover:underline"
            >
              {incident.title}
            </Link>
          </span>
          <span className="flex flex-wrap items-center gap-2 text-meta text-fg-secondary">
            <StateBadge label={translateStates(incident.state)} />
            {translateIncidents('declared', {
              time: format.dateAndTime(new Date(incident.declaredAt)),
            })}
          </span>
        </TabListRow>
      )}
    />
  );
}

function ServiceChangesTab({ service }: { service: ServiceDetail }) {
  const translateChanges = useTranslations('services.changes');
  const format = useRelyxusFormat();
  return (
    <TabList
      items={service.recentChanges}
      emptyText={translateChanges('empty')}
      renderItem={(change) => (
        <TabListRow key={change.id}>
          <span className="text-table font-semibold">{change.summary}</span>
          <span className="text-meta text-fg-secondary">
            {translateChanges('detail', {
              source: change.sourceName,
              time: format.dateAndTime(new Date(change.changedAt)),
            })}
          </span>
        </TabListRow>
      )}
    />
  );
}

function ServicePoliciesTab({ service }: { service: ServiceDetail }) {
  const translatePolicies = useTranslations('services.policies');
  return (
    <TabList
      items={service.policies}
      emptyText={translatePolicies('empty')}
      renderItem={(policy) => (
        <TabListRow key={policy.id}>
          <span className="text-table font-semibold">{policy.name}</span>
          <span className="text-meta text-fg-secondary">{policy.summary}</span>
        </TabListRow>
      )}
    />
  );
}

function ServiceVendorsAndRegionsTab({ service }: { service: ServiceDetail }) {
  const translateVendors = useTranslations('services.vendorsAndRegions');
  const translateKinds = useTranslations('services.dependencyKinds');
  return (
    <TabList
      items={service.vendorsAndRegions}
      emptyText={translateVendors('empty')}
      renderItem={(external) => (
        <TabListRow key={external.id}>
          <span className="flex items-center justify-between gap-3">
            <span className="text-table font-semibold">{external.name}</span>
            <ServiceHealthLabel health={external.health} />
          </span>
          <span className="text-meta text-fg-secondary">{translateKinds(external.kind)}</span>
        </TabListRow>
      )}
    />
  );
}

function ServiceHistoryTab({ service }: { service: ServiceDetail }) {
  const translateHistory = useTranslations('services.history');
  const format = useRelyxusFormat();
  return (
    <TabList
      items={service.history}
      emptyText={translateHistory('empty')}
      renderItem={(entry) => (
        <TabListRow key={entry.id}>
          <span className="text-table font-semibold">{entry.summary}</span>
          <span className="text-meta text-fg-secondary">
            {translateHistory('detail', {
              actor: entry.actorName,
              time: format.dateAndTime(new Date(entry.occurredAt)),
            })}
          </span>
        </TabListRow>
      )}
    />
  );
}

type ServiceDetailTabsProps = {
  workspaceSlug: string;
  service: ServiceDetail;
  dependenciesQuery: UseQueryResult<ServiceDependencies>;
  selectedTab: ServiceDetailTab;
  onSelectTab: (tab: string) => void;
};

/** The nine service tabs of UI/UX s. 13.2; the selected tab lives in the URL. */
export function ServiceDetailTabs({
  workspaceSlug,
  service,
  dependenciesQuery,
  selectedTab,
  onSelectTab,
}: ServiceDetailTabsProps) {
  const translateTabs = useTranslations('services.tabs');

  const tabContents = {
    overview: <ServiceOverviewTab service={service} />,
    dependencies: (
      <ServiceDependenciesTab workspaceSlug={workspaceSlug} dependenciesQuery={dependenciesQuery} />
    ),
    slos: <ServiceSlosTab service={service} />,
    incidents: <ServiceIncidentsTab workspaceSlug={workspaceSlug} service={service} />,
    changes: <ServiceChangesTab service={service} />,
    policies: <ServicePoliciesTab service={service} />,
    owners: <ServiceOwnersTab service={service} />,
    'vendors-and-regions': <ServiceVendorsAndRegionsTab service={service} />,
    history: <ServiceHistoryTab service={service} />,
  } satisfies Record<ServiceDetailTab, ReactNode>;

  return (
    <Tabs value={selectedTab} onValueChange={onSelectTab}>
      <TabsList aria-label={translateTabs('label')} className="overflow-x-auto">
        {serviceDetailTabs.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {translateTabs(tab)}
          </TabsTrigger>
        ))}
      </TabsList>
      {serviceDetailTabs.map((tab) => (
        <TabsContent key={tab} value={tab}>
          {tabContents[tab]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
