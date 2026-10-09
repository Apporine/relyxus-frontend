import type { CatalogueConnector, ConnectedSystem } from '@/features/integrations/model';

/* DEVELOPMENT FIXTURE. Integrations for the Payments / UK demo (Figma frame 24). */

const connectedSystems: ConnectedSystem[] = [
  {
    id: 'conn-prometheus',
    name: 'Prometheus prod',
    category: 'Metrics',
    health: 'connected',
    scope: '13 services',
    accessMode: 'read-only',
  },
  {
    id: 'conn-loki',
    name: 'Grafana Loki',
    category: 'Logs',
    health: 'connected',
    scope: '11 services',
    accessMode: 'read-only',
  },
  {
    id: 'conn-servicenow',
    name: 'ServiceNow',
    category: 'ITSM',
    health: 'degraded',
    scope: 'Changes and incidents',
    accessMode: 'write-gated',
  },
  {
    id: 'conn-teams',
    name: 'Microsoft Teams',
    category: 'Chat',
    health: 'connected',
    scope: 'Incident channels',
    accessMode: 'write-gated',
  },
  {
    id: 'conn-aws',
    name: 'AWS',
    category: 'Cloud',
    health: 'connected',
    scope: '3 accounts',
    accessMode: 'read-only',
  },
  {
    id: 'conn-openshift',
    name: 'OpenShift',
    category: 'Kubernetes',
    health: 'connected',
    scope: '2 clusters',
    accessMode: 'write-disabled',
  },
];

const catalogue: CatalogueConnector[] = [
  { id: 'catalogue-prometheus', name: 'Prometheus', category: 'Metrics', isConnected: true },
  { id: 'catalogue-datadog', name: 'Datadog', category: 'Observability', isConnected: false },
  { id: 'catalogue-loki', name: 'Grafana Loki', category: 'Logs', isConnected: true },
  { id: 'catalogue-servicenow', name: 'ServiceNow', category: 'ITSM', isConnected: true },
  { id: 'catalogue-jira', name: 'Jira', category: 'Work tracking', isConnected: false },
  { id: 'catalogue-pagerduty', name: 'PagerDuty', category: 'Paging', isConnected: false },
  { id: 'catalogue-teams', name: 'Microsoft Teams', category: 'Chat', isConnected: true },
  { id: 'catalogue-cloudwatch', name: 'AWS CloudWatch', category: 'Cloud', isConnected: true },
  { id: 'catalogue-kubernetes', name: 'Kubernetes', category: 'Kubernetes', isConnected: true },
];

export function connectedSystemsFor(workspaceSlug: string): ConnectedSystem[] {
  return workspaceSlug === 'payments-uk' ? connectedSystems : [];
}

export function connectorCatalogueFor(workspaceSlug: string): CatalogueConnector[] {
  return workspaceSlug === 'payments-uk' ? catalogue : [];
}
