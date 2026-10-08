import { http, HttpResponse } from 'msw';

import type { IncidentType } from '@/features/incidents/declaration-model';

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

/** Mock Service Worker handlers for incident declaration (development only). */
export const incidentDeclarationHandlers = [
  http.get('/api/v1/workspaces/:workspaceSlug/incident-types', ({ params }) => {
    if (String(params.workspaceSlug) !== 'payments-uk') {
      return HttpResponse.json({ items: [] });
    }
    return HttpResponse.json({ items: paymentsUkIncidentTypes });
  }),

  http.post('/api/v1/workspaces/:workspaceSlug/incidents', ({ params }) => {
    if (String(params.workspaceSlug) !== 'payments-uk') {
      return HttpResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }
    const reference = `INC-${nextDeclaredReference}`;
    nextDeclaredReference += 1;
    return HttpResponse.json({ reference }, { status: 201 });
  }),
];
