import { z } from 'zod';

import {
  incidentStateSchema,
  incidentVisibilitySchema,
  paginatedListSchema,
} from '@/lib/domain/schemas';

/*
 * Incident types, fields and forms (UI/UX s. 13.3; Product s. 8A). Types are versioned;
 * past incidents stay pinned to the version they were declared with. Provisional contract
 * (ADR 0004).
 */
export const incidentTypeStates = ['draft', 'published', 'archived'] as const;

export const incidentTypeSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.number().int().positive(),
  state: z.enum(incidentTypeStates),
});
export type IncidentTypeSummary = z.infer<typeof incidentTypeSummarySchema>;

export const incidentTypeListSchema = paginatedListSchema(incidentTypeSummarySchema);

export const incidentTypeDetailSchema = incidentTypeSummarySchema.extend({
  declarationFields: z.array(z.string().min(1)),
  requiredFields: z.array(z.string().min(1)),
  conditionalFields: z.array(z.object({ field: z.string().min(1), condition: z.string().min(1) })),
  defaultVisibility: incidentVisibilitySchema,
  lifecycle: z.array(incidentStateSchema).min(1),
  automations: z.array(z.string().min(1)),
  regulatorMappings: z.array(z.string().min(1)),
});
export type IncidentTypeDetail = z.infer<typeof incidentTypeDetailSchema>;
