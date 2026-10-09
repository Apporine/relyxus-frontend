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

/*
 * Integrations hub (UI/UX s. 13.1; Product s. 7): every connection with its scope and access
 * mode, and the catalogue of connectors that can be added. Provisional contract (ADR 0004).
 */
export const connectorAccessModes = ['read-only', 'write-gated', 'write-disabled'] as const;

export const connectedSystemSchema = connectorSummarySchema.extend({
  category: z.string().min(1),
  /** What the connector can see, for example "13 services" or "2 clusters". */
  scope: z.string().min(1),
  accessMode: z.enum(connectorAccessModes),
});
export type ConnectedSystem = z.infer<typeof connectedSystemSchema>;

export const connectedSystemListSchema = paginatedListSchema(connectedSystemSchema);

export const catalogueConnectorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  isConnected: z.boolean(),
});
export type CatalogueConnector = z.infer<typeof catalogueConnectorSchema>;

export const connectorCatalogueSchema = paginatedListSchema(catalogueConnectorSchema);
