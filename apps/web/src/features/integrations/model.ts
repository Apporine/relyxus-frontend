import { z } from 'zod';

import { connectorHealthSchema, paginatedListSchema } from '@/lib/domain/schemas';

/* Connector health summary (Product s. 7). Provisional contract (ADR 0004). */
export const connectorSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  health: connectorHealthSchema,
});
export type ConnectorSummary = z.infer<typeof connectorSummarySchema>;

export const connectorSummaryListSchema = paginatedListSchema(connectorSummarySchema);
