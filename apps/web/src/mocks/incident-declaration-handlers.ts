import { http, HttpResponse } from 'msw';

import type { IncidentType } from '@/features/incidents/declaration-model';
import { declareIncidentRequestSchema } from '@/features/incidents/declaration-model';
import { incidentListBusinessServices } from '@/features/incidents/incident-list-services';

import { registerDeclaredIncident } from './fixtures/incident-fixtures';

/** Incident types available in the Payments / UK demo workspace (Figma frame 05). */
const paymentsUkIncidentTypes: IncidentType[] = [
  {
    id: 'payment-outage',
    name: 'Payment outage',
    environment: 'production',
    suggestedSeverity: 'SEV1',
  },
  {
    id: 'degraded-performance',
    name: 'Degraded performance',
    environment: 'production',
    suggestedSeverity: 'SEV2',
  },
  {
    id: 'security-event',
    name: 'Security event',
    environment: 'production',
    suggestedSeverity: 'SEV1',
  },
  {
    id: 'data-integrity',
    name: 'Data integrity concern',
    environment: 'production',
    suggestedSeverity: 'SEV2',
  },
];

let nextDeclaredReference = 2099;

const businessServiceNameById = Object.fromEntries(
  incidentListBusinessServices.map((service) => [service.id, service.name]),
) as Record<string, string>;

/** Mock Service Worker handlers for incident declaration (development only). */
export const incidentDeclarationHandlers = [
  http.get('/api/v1/workspaces/:workspaceSlug/incident-types', ({ params }) => {
    if (String(params.workspaceSlug) !== 'payments-uk') {
      return HttpResponse.json({ items: [] });
    }
    return HttpResponse.json({ items: paymentsUkIncidentTypes });
  }),

  http.post('/api/v1/workspaces/:workspaceSlug/incidents', async ({ request, params }) => {
    const workspaceSlug = String(params.workspaceSlug);
    if (workspaceSlug !== 'payments-uk') {
      return HttpResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }

    const body = declareIncidentRequestSchema.parse(await request.json());
    const reference = `INC-${nextDeclaredReference}`;
    nextDeclaredReference += 1;
    const now = new Date().toISOString();
    const incidentType = paymentsUkIncidentTypes.find((type) => type.id === body.incidentTypeId);

    registerDeclaredIncident(workspaceSlug, {
      reference,
      title: body.title,
      severity: body.severity,
      state: 'investigating',
      visibility: body.visibility,
      environment: incidentType?.environment ?? 'production',
      businessServiceNames: body.businessServiceIds.map((id) => businessServiceNameById[id] ?? id),
      ownerTeamName: null,
      impact: {
        moneyAtRisk: body.impact?.moneyAtRisk ?? null,
        failedTransactions: body.impact?.failedTransactions ?? null,
        affectedCustomers: body.impact?.affectedCustomers ?? null,
      },
      impactStartedAt: now,
      declaredAt: now,
    });

    return HttpResponse.json({ reference }, { status: 201 });
  }),
];
