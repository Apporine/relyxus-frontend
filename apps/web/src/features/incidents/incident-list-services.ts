/*
 * Business services shown in the Incident List service filter (UI/UX s. 10.2). Provisional
 * until the services API drives this control (ADR 0004).
 */
export const incidentListBusinessServices = [
  { id: 'svc-card-payments', name: 'Card payments' },
  { id: 'svc-settlement', name: 'Settlement' },
  { id: 'svc-customer-login', name: 'Customer login' },
  { id: 'svc-merchant-api', name: 'Merchant API' },
] as const;
