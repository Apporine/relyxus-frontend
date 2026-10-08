import { z } from 'zod';

import { paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Important business services whose impact tolerance is threatened (Product s. 12; UI/UX
 * s. 12.5). Provisional contract (ADR 0004).
 */
export const businessServiceHealthStates = ['at-risk', 'degraded', 'monitoring'] as const;
export type BusinessServiceHealth = (typeof businessServiceHealthStates)[number];

export const businessServiceAtRiskSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  health: z.enum(businessServiceHealthStates),
});
export type BusinessServiceAtRisk = z.infer<typeof businessServiceAtRiskSchema>;

export const businessServiceAtRiskListSchema = paginatedListSchema(businessServiceAtRiskSchema);
