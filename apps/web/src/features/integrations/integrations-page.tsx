'use client';

import {
  ConnectorHealthBadge,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { useRefreshOnLiveEvents } from '@/lib/live/use-refresh-on-live-events';
import { DataTable } from '@/lib/ui/data-table';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useSearchParamChoice } from '@/lib/ui/use-search-param-choice';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import type { ConnectedSystem } from './model';
import {
  connectorHealthEvents,
  integrationQueryKeys,
  useConnectedSystems,
  useConnectorCatalogue,
} from './queries';

const integrationViews = ['connected', 'catalogue'] as const;

function ConnectedSystemsPanel() {
  const translateIntegrations = useTranslations('integrations');
  const translateHealth = useTranslations('domain.connectorHealth');
  const { workspace } = useCurrentWorkspace();
  const connectedQuery = useConnectedSystems(workspace.slug);

  return (
    <Panel title={translateIntegrations('connected.title')}>
      <p className="-mt-2 text-meta text-fg-secondary">
        {translateIntegrations('connected.description')}
      </p>
      <QuerySection
        query={connectedQuery}
        sectionName={translateIntegrations('connected.title')}
        loadingPlaceholder={<Skeleton className="h-80 w-full" />}
      >
        {(connectedSystems) => (
          <DataTable<ConnectedSystem>
            caption={translateIntegrations('connected.title')}
            rows={connectedSystems}
            getRowKey={(connector) => connector.id}
            emptyText={translateIntegrations('connected.empty')}
            columns={[
              {
                key: 'connector',
                header: translateIntegrations('columns.connector'),
                isRowHeader: true,
                render: (connector) => connector.name,
              },
              {
                key: 'type',
                header: translateIntegrations('columns.type'),
                render: (connector) => connector.category,
              },
              {
                key: 'health',
                header: translateIntegrations('columns.health'),
                render: (connector) => (
                  <ConnectorHealthBadge
                    health={connector.health}
                    label={translateHealth(connector.health)}
                  />
                ),
              },
              {
                key: 'scope',
                header: translateIntegrations('columns.scope'),
                render: (connector) => connector.scope,
              },
              {
                key: 'mode',
                header: translateIntegrations('columns.mode'),
                render: (connector) => translateIntegrations(`accessModes.${connector.accessMode}`),
              },
            ]}
          />
        )}
      </QuerySection>
    </Panel>
  );
}

function ConnectorCataloguePanel() {
  const translateIntegrations = useTranslations('integrations');
  const { workspace } = useCurrentWorkspace();
  const catalogueQuery = useConnectorCatalogue(workspace.slug);

  return (
    <Panel title={translateIntegrations('catalogue.title')}>
      <p className="-mt-2 text-meta text-fg-secondary">
        {translateIntegrations('catalogue.description')}
      </p>
      <QuerySection
        query={catalogueQuery}
        sectionName={translateIntegrations('catalogue.title')}
        loadingPlaceholder={<Skeleton className="h-80 w-full" />}
      >
        {(connectors) => (
          <ul className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
            {connectors.map((connector) => (
              <li
                key={connector.id}
                className="flex flex-col gap-1 rounded-panel border border-divider p-4"
              >
                <span className="text-body font-semibold">{connector.name}</span>
                <span className="text-meta text-fg-secondary">{connector.category}</span>
                <span
                  className={
                    connector.isConnected
                      ? 'text-meta font-semibold text-healthy'
                      : 'text-meta text-fg-tertiary'
                  }
                >
                  {translateIntegrations(
                    connector.isConnected ? 'catalogue.connected' : 'catalogue.available',
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </QuerySection>
    </Panel>
  );
}

/** Integrations hub (UI/UX s. 13.1, Figma frame 24): what is connected and how. */
export function IntegrationsPage() {
  const translateIntegrations = useTranslations('integrations');
  const { workspace } = useCurrentWorkspace();
  const [view, selectView] = useSearchParamChoice('view', integrationViews, 'connected');
  useRefreshOnLiveEvents(connectorHealthEvents, integrationQueryKeys.connectors(workspace.slug));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateIntegrations('title')}
        description={translateIntegrations('description')}
        actions={
          <UnavailableAction
            label={translateIntegrations('addConnector')}
            reason={translateIntegrations('addConnectorUnavailable')}
          />
        }
      />
      <Tabs value={view} onValueChange={selectView} variant="contained">
        <TabsList aria-label={translateIntegrations('viewsLabel')} className="self-start">
          {integrationViews.map((integrationView) => (
            <TabsTrigger key={integrationView} value={integrationView}>
              {translateIntegrations(`views.${integrationView}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="connected">
          <ConnectedSystemsPanel />
        </TabsContent>
        <TabsContent value="catalogue">
          <ConnectorCataloguePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
