import type {
  DependencyNeighbour,
  DependencyType,
  ServiceDependencies,
  ServiceDetail,
  ServiceHealth,
  ServiceSummary,
} from '@/features/services/model';
import type { IncidentSummary } from '@/features/incidents/model';

import { incidentRecordsFor } from './incident-fixtures';

/*
 * DEVELOPMENT FIXTURE. Service catalogue for the Payments / UK demo workspace (Figma frame
 * 26). Each catalogue state from UI/UX s. 13.2 appears on at least one service: an unconfirmed
 * discovery (ledger-sync), conflicting sources and an overdue owner confirmation
 * (notification-gateway), no owner (ledger-sync), a stale retired service
 * (legacy-batch-export), a vendor outage (payments-api) and more dependents than the map
 * shows at once (customer-auth).
 */

const DEMO_WORKSPACE_SLUG = 'payments-uk';
const PLATFORM_TEAM_NAME = 'Platform engineering';
const MILLISECONDS_PER_HOUR = 3_600_000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * MILLISECONDS_PER_HOUR).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * MILLISECONDS_PER_DAY).toISOString();

type ExternalProvider = Pick<DependencyNeighbour, 'id' | 'name' | 'health'> & {
  kind: Exclude<DependencyNeighbour['kind'], 'service'>;
};

const externalProviders: ExternalProvider[] = [
  { id: 'northwind-acquiring', name: 'Northwind Acquiring', kind: 'vendor', health: 'outage' },
  { id: 'aws-eu-west-2', name: 'AWS eu-west-2', kind: 'cloud-region', health: 'healthy' },
  { id: 'aws-eu-west-1', name: 'AWS eu-west-1', kind: 'cloud-region', health: 'healthy' },
];

type ServiceFixture = Omit<ServiceDetail, 'recentIncidents' | 'vendorsAndRegions'>;

function serviceFixture(
  summary: ServiceSummary,
  detail: Partial<Omit<ServiceFixture, keyof ServiceSummary>> = {},
): ServiceFixture {
  return {
    ...summary,
    description: null,
    environments: ['production'],
    businessServices: [],
    sourceRecords: [
      {
        source: 'discovery',
        externalId: `eks-prod-1/payments/${summary.id}`,
        lastSyncedAt: hoursAgo(1),
      },
    ],
    conflicts: [],
    fallbackTeamName: PLATFORM_TEAM_NAME,
    ownerConfirmedAt: summary.owner === null ? null : daysAgo(40),
    onCallScheduleName: null,
    slos: [],
    recentChanges: [],
    policies: [],
    history: [],
    ...detail,
  };
}

function summary(
  id: string,
  tier: ServiceSummary['tier'],
  health: ServiceHealth,
  ownerTeamName: string | null,
  overrides: Partial<ServiceSummary> = {},
): ServiceSummary {
  return {
    id,
    name: id,
    tier,
    health,
    lifecycle: 'active',
    discovery: 'confirmed',
    owner:
      ownerTeamName === null ? null : { teamName: ownerTeamName, isConfirmationOverdue: false },
    hasConflictingSources: false,
    isStale: false,
    ...overrides,
  };
}

const serviceFixtures: ServiceFixture[] = [
  serviceFixture(summary('payments-api', 'tier-0', 'at-risk', 'Payments platform'), {
    description: 'Authorises and captures card payments for UK merchants.',
    environments: ['production', 'staging'],
    businessServices: [{ id: 'svc-card-payments', name: 'Card payments' }],
    sourceRecords: [
      { source: 'cmdb', externalId: 'CI0042187', lastSyncedAt: hoursAgo(6) },
      {
        source: 'catalogue',
        externalId: 'component:default/payments-api',
        lastSyncedAt: hoursAgo(2),
      },
      {
        source: 'discovery',
        externalId: 'eks-prod-1/payments/payments-api',
        lastSyncedAt: hoursAgo(1),
      },
    ],
    onCallScheduleName: 'Payments primary',
    ownerConfirmedAt: daysAgo(21),
    slos: [
      {
        id: 'payments-api-availability',
        name: 'Authorisation availability',
        objectivePercent: 99.95,
        attainmentPercent: 99.81,
        errorBudgetRemainingPercent: 0,
        windowDays: 28,
      },
      {
        id: 'payments-api-latency',
        name: 'Authorisation p99 under 800 ms',
        objectivePercent: 99,
        attainmentPercent: 99.4,
        errorBudgetRemainingPercent: 40,
        windowDays: 28,
      },
    ],
    recentChanges: [
      {
        id: 'change-config-rollout',
        summary: 'Configuration rollout: card routing rules v42',
        sourceName: 'Argo CD',
        changedAt: hoursAgo(1),
      },
      {
        id: 'change-release-3-18',
        summary: 'Release 3.18.0',
        sourceName: 'GitHub Actions',
        changedAt: daysAgo(2),
      },
    ],
    policies: [
      {
        id: 'policy-tier-0-production',
        name: 'Tier 0 production changes',
        summary: 'Two approvers, one from Payments platform; restart and rollback only.',
      },
    ],
    history: [
      {
        id: 'history-owner-confirmed',
        summary: 'Ownership confirmed by Payments platform',
        actorName: 'Sara Malik',
        occurredAt: daysAgo(21),
      },
      {
        id: 'history-tier-set',
        summary: 'Tier set to Tier 0',
        actorName: 'A. Rahman',
        occurredAt: daysAgo(180),
      },
    ],
  }),
  serviceFixture(summary('card-router', 'tier-0', 'healthy', 'Payments platform'), {
    businessServices: [{ id: 'svc-card-payments', name: 'Card payments' }],
    onCallScheduleName: 'Payments primary',
  }),
  serviceFixture(summary('fraud-score', 'tier-1', 'healthy', 'Risk engineering'), {
    businessServices: [{ id: 'svc-card-payments', name: 'Card payments' }],
  }),
  serviceFixture(summary('customer-auth', 'tier-0', 'healthy', 'Identity'), {
    businessServices: [{ id: 'svc-customer-login', name: 'Customer login' }],
    onCallScheduleName: 'Identity primary',
  }),
  serviceFixture(summary('settlement-worker', 'tier-1', 'degraded', 'Settlement'), {
    businessServices: [{ id: 'svc-settlement', name: 'Settlement' }],
  }),
  serviceFixture(summary('postgres-pay', 'tier-1', 'healthy', 'Data platform')),
  serviceFixture(summary('redis-session', 'tier-1', 'healthy', 'Data platform')),
  serviceFixture(summary('api-gateway', 'tier-0', 'healthy', PLATFORM_TEAM_NAME)),
  serviceFixture(summary('checkout-web', 'tier-1', 'healthy', 'Checkout')),
  serviceFixture(summary('merchant-portal', 'tier-2', 'healthy', 'Merchant experience')),
  serviceFixture(summary('mobile-backend', 'tier-1', 'healthy', 'Mobile')),
  serviceFixture(
    summary('notification-gateway', 'tier-2', 'healthy', 'Messaging', {
      owner: { teamName: 'Messaging', isConfirmationOverdue: true },
      hasConflictingSources: true,
    }),
    {
      sourceRecords: [
        { source: 'cmdb', externalId: 'CI0051320', lastSyncedAt: hoursAgo(5) },
        {
          source: 'catalogue',
          externalId: 'component:default/notification-gateway',
          lastSyncedAt: hoursAgo(3),
        },
      ],
      conflicts: [
        {
          field: 'owner',
          values: [
            { source: 'cmdb', value: 'Messaging' },
            { source: 'catalogue', value: 'Customer communications' },
          ],
          appliedSource: 'cmdb',
        },
      ],
      ownerConfirmedAt: daysAgo(130),
    },
  ),
  serviceFixture(summary('ledger-sync', 'tier-2', 'unknown', null, { discovery: 'unconfirmed' }), {
    sourceRecords: [
      {
        source: 'discovery',
        externalId: 'eks-prod-1/ledger/ledger-sync',
        lastSyncedAt: hoursAgo(2),
      },
    ],
  }),
  serviceFixture(
    summary('legacy-batch-export', 'tier-3', 'unknown', 'Settlement', {
      lifecycle: 'retired',
      isStale: true,
    }),
    {
      sourceRecords: [{ source: 'cmdb', externalId: 'CI0019044', lastSyncedAt: daysAgo(45) }],
    },
  ),
];

/** Who depends on whom: each pair reads "from depends on to". */
const dependencyEdges: { from: string; to: string; type: DependencyType }[] = [
  { from: 'payments-api', to: 'card-router', type: 'calls' },
  { from: 'payments-api', to: 'fraud-score', type: 'calls' },
  { from: 'payments-api', to: 'customer-auth', type: 'calls' },
  { from: 'payments-api', to: 'postgres-pay', type: 'stores-data-in' },
  { from: 'payments-api', to: 'redis-session', type: 'stores-data-in' },
  { from: 'payments-api', to: 'northwind-acquiring', type: 'provided-by' },
  { from: 'payments-api', to: 'aws-eu-west-2', type: 'hosted-in' },
  { from: 'api-gateway', to: 'payments-api', type: 'calls' },
  { from: 'checkout-web', to: 'payments-api', type: 'calls' },
  { from: 'merchant-portal', to: 'payments-api', type: 'calls' },
  { from: 'mobile-backend', to: 'payments-api', type: 'calls' },
  { from: 'card-router', to: 'northwind-acquiring', type: 'provided-by' },
  { from: 'card-router', to: 'aws-eu-west-2', type: 'hosted-in' },
  { from: 'settlement-worker', to: 'postgres-pay', type: 'stores-data-in' },
  { from: 'settlement-worker', to: 'ledger-sync', type: 'calls' },
  { from: 'settlement-worker', to: 'aws-eu-west-1', type: 'hosted-in' },
  { from: 'ledger-sync', to: 'postgres-pay', type: 'stores-data-in' },
  { from: 'notification-gateway', to: 'aws-eu-west-2', type: 'hosted-in' },
  ...[
    'card-router',
    'fraud-score',
    'checkout-web',
    'merchant-portal',
    'mobile-backend',
    'api-gateway',
    'notification-gateway',
    'settlement-worker',
    'ledger-sync',
  ].map((serviceId) => ({ from: serviceId, to: 'customer-auth', type: 'calls' as const })),
];

/** Incidents per service; the server omits those the viewer may not open, such as INC-1999. */
const incidentServiceIds: Record<string, string[]> = {
  'INC-2041': ['payments-api', 'card-router'],
  'INC-1999': ['payments-api'],
  'INC-2038': ['settlement-worker'],
  'INC-2037': ['customer-auth'],
  'INC-2034': ['notification-gateway'],
  'INC-2031': ['settlement-worker', 'ledger-sync'],
};

function isDemoWorkspace(workspaceSlug: string): boolean {
  return workspaceSlug === DEMO_WORKSPACE_SLUG;
}

function toSummary(fixture: ServiceFixture): ServiceSummary {
  const { id, name, tier, health, lifecycle, discovery, owner, hasConflictingSources, isStale } =
    fixture;
  return { id, name, tier, health, lifecycle, discovery, owner, hasConflictingSources, isStale };
}

const confirmedServiceIds = new Set<string>();

function withRecordedConfirmation(fixture: ServiceFixture): ServiceFixture {
  return confirmedServiceIds.has(fixture.id) ? { ...fixture, discovery: 'confirmed' } : fixture;
}

function findServiceFixture(serviceId: string): ServiceFixture | undefined {
  const fixture = serviceFixtures.find((service) => service.id === serviceId);
  return fixture === undefined ? undefined : withRecordedConfirmation(fixture);
}

function neighbourFor(nodeId: string, dependencyType: DependencyType): DependencyNeighbour | null {
  const service = findServiceFixture(nodeId);
  if (service !== undefined) {
    return {
      id: service.id,
      name: service.name,
      kind: 'service',
      health: service.health,
      dependencyType,
    };
  }
  const provider = externalProviders.find((external) => external.id === nodeId);
  return provider === undefined ? null : { ...provider, dependencyType };
}

/** Catalogue summaries whose name or owner team contains the search text. */
export function serviceSummariesFor(workspaceSlug: string, searchText: string): ServiceSummary[] {
  if (!isDemoWorkspace(workspaceSlug)) {
    return [];
  }
  const normalisedSearch = searchText.trim().toLocaleLowerCase();
  return serviceFixtures
    .map(withRecordedConfirmation)
    .map(toSummary)
    .filter(
      (service) =>
        normalisedSearch === '' ||
        service.name.toLocaleLowerCase().includes(normalisedSearch) ||
        (service.owner?.teamName.toLocaleLowerCase().includes(normalisedSearch) ?? false),
    );
}

export function serviceDependenciesFor(
  workspaceSlug: string,
  serviceId: string,
): ServiceDependencies | null {
  if (!isDemoWorkspace(workspaceSlug) || findServiceFixture(serviceId) === undefined) {
    return null;
  }
  return {
    serviceId,
    dependents: dependencyEdges
      .filter((edge) => edge.to === serviceId)
      .map((edge) => neighbourFor(edge.from, edge.type))
      .filter((neighbour) => neighbour !== null),
    dependencies: dependencyEdges
      .filter((edge) => edge.from === serviceId)
      .map((edge) => neighbourFor(edge.to, edge.type))
      .filter((neighbour) => neighbour !== null),
  };
}

function recentIncidentsFor(workspaceSlug: string, serviceId: string): IncidentSummary[] {
  return (incidentRecordsFor(workspaceSlug) ?? []).filter((incident) =>
    incidentServiceIds[incident.reference]?.includes(serviceId),
  );
}

export function serviceDetailFor(workspaceSlug: string, serviceId: string): ServiceDetail | null {
  const fixture = isDemoWorkspace(workspaceSlug) ? findServiceFixture(serviceId) : undefined;
  if (fixture === undefined) {
    return null;
  }
  const externalDependencies = (
    serviceDependenciesFor(workspaceSlug, serviceId)?.dependencies ?? []
  )
    .filter(
      (neighbour): neighbour is DependencyNeighbour & { kind: ExternalProvider['kind'] } =>
        neighbour.kind !== 'service',
    )
    .map(({ id, name, kind, health }) => ({ id, name, kind, health }));
  return {
    ...fixture,
    recentIncidents: recentIncidentsFor(workspaceSlug, serviceId).map(
      ({ reference, title, severity, state, declaredAt }) => ({
        reference,
        title,
        severity,
        state,
        declaredAt,
      }),
    ),
    vendorsAndRegions: externalDependencies,
  };
}

/** Records a confirmation; returns false when the service does not exist. */
export function recordServiceConfirmation(workspaceSlug: string, serviceId: string): boolean {
  if (!isDemoWorkspace(workspaceSlug) || findServiceFixture(serviceId) === undefined) {
    return false;
  }
  confirmedServiceIds.add(serviceId);
  return true;
}

/** Clears recorded confirmations, so each test starts from the original catalogue. */
export function forgetRecordedServiceConfirmations(): void {
  confirmedServiceIds.clear();
}

/** Services an incident affects, for the war room's links to dependency evidence. */
export function affectedServicesFor(incidentReference: string): { id: string; name: string }[] {
  return (incidentServiceIds[incidentReference] ?? [])
    .map((serviceId) => findServiceFixture(serviceId))
    .filter((service) => service !== undefined)
    .map(({ id, name }) => ({ id, name }));
}

/** Technical services mapped to a business service, as the business view lists them. */
export function technicalServicesLinkedTo(
  businessServiceId: string,
): { id: string; name: string; health: ServiceHealth }[] {
  return serviceFixtures
    .filter((service) =>
      service.businessServices.some((businessService) => businessService.id === businessServiceId),
    )
    .map(({ id, name, health }) => ({ id, name, health }));
}
