import {
  connectorHealthStates,
  environments,
  incidentStates,
  incidentVisibilities,
  severityLevels,
} from '@relyxus/ui';
import { z } from 'zod';

/*
 * Zod schemas for the product vocabulary. The values are defined once in @relyxus/ui, which
 * renders them; API responses are validated against the same lists.
 */

export const severitySchema = z.enum(severityLevels);
export const incidentStateSchema = z.enum(incidentStates);
export const incidentVisibilitySchema = z.enum(incidentVisibilities);
export const environmentSchema = z.enum(environments);
export const connectorHealthSchema = z.enum(connectorHealthStates);

export const isoDateTimeSchema = z.iso.datetime({ offset: true });

/** Money as an integer amount in the minor unit plus its ISO 4217 code (Product s. 14). */
export const moneySchema = z.object({
  amountInMinorUnits: z.number().int(),
  currencyCode: z.string().length(3),
});

/** Every money-at-risk value shows how it was obtained (Product s. 8, business impact model). */
export const impactConfidenceSchema = z.enum(['measured', 'estimated', 'assumed']);

/** Cursor pagination wrapper used by every list endpoint (Product s. 22A). */
export function paginatedListSchema<ItemSchema extends z.ZodType>(itemSchema: ItemSchema) {
  return z.object({
    items: z.array(itemSchema),
    nextCursor: z.string().nullable(),
  });
}
