import { z } from 'zod';

import {
  environmentSchema,
  impactConfidenceSchema,
  incidentStateSchema,
  incidentVisibilitySchema,
  isoDateTimeSchema,
  moneySchema,
  paginatedListSchema,
  severitySchema,
} from '@/lib/domain/schemas';

/*
 * Incident summary shown in lists and the Command Centre. Fields come from the Incident
 * entity (Product s. 20) and the incident list columns (UI/UX s. 10.2). Provisional until
 * the OpenAPI contract is published (ADR 0004). Restricted incidents the viewer may not see
 * are omitted by the server; the client never receives them.
 */
export const incidentSummarySchema = z.object({
  /** Human reference, for example "INC-2041". */
  reference: z.string().min(1),
  title: z.string().min(1),
  severity: severitySchema,
  state: incidentStateSchema,
  visibility: incidentVisibilitySchema,
  environment: environmentSchema,
  businessServiceNames: z.array(z.string()),
  ownerTeamName: z.string().nullable(),
  impact: z.object({
    moneyAtRisk: moneySchema.extend({ confidence: impactConfidenceSchema }).nullable(),
    failedTransactions: z.number().int().nonnegative().nullable(),
    affectedCustomers: z.number().int().nonnegative().nullable(),
  }),
  impactStartedAt: isoDateTimeSchema,
  declaredAt: isoDateTimeSchema,
});
export type IncidentSummary = z.infer<typeof incidentSummarySchema>;

export const incidentSummaryListSchema = paginatedListSchema(incidentSummarySchema);
