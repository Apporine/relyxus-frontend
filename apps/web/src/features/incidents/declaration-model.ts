import { z } from 'zod';

import {
  environmentSchema,
  impactConfidenceSchema,
  incidentVisibilitySchema,
  moneySchema,
  severitySchema,
} from '@/lib/domain/schemas';

/** Configured incident type from the workspace library (UI/UX s. 10.3). Provisional (ADR 0004). */
export const incidentTypeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  environment: environmentSchema,
  /** Default severity suggested from the type definition; the person may override it. */
  suggestedSeverity: severitySchema,
});
export type IncidentType = z.infer<typeof incidentTypeSchema>;

export const incidentTypeListSchema = z.object({
  items: z.array(incidentTypeSchema),
});

export const declareIncidentRequestSchema = z.object({
  incidentTypeId: z.string().min(1),
  title: z.string().min(1),
  businessServiceIds: z.array(z.string().min(1)).min(1),
  technicalComponent: z.string().optional(),
  severity: severitySchema,
  visibility: incidentVisibilitySchema,
  context: z.string().optional(),
  impact: z
    .object({
      moneyAtRisk: moneySchema.extend({ confidence: impactConfidenceSchema }).nullable(),
      failedTransactions: z.number().int().nonnegative().nullable(),
      affectedCustomers: z.number().int().nonnegative().nullable(),
    })
    .optional(),
});
export type DeclareIncidentRequest = z.infer<typeof declareIncidentRequestSchema>;

export const declareIncidentResponseSchema = z.object({
  reference: z.string().min(1),
});
export type DeclareIncidentResponse = z.infer<typeof declareIncidentResponseSchema>;
