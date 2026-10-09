import { z } from 'zod';

import { isoDateTimeSchema } from '@/lib/domain/schemas';

/*
 * Audit log (UI/UX s. 13.11; Product s. 14). An append-only ledger whose entries are
 * hash-chained and streamed to the customer's SIEM. Details of restricted items arrive
 * already masked from the server. Provisional contract (ADR 0004).
 */
export const auditEventCategories = [
  'all',
  'incident',
  'action',
  'approval',
  'policy',
  'report',
  'support',
] as const;
export type AuditEventCategory = (typeof auditEventCategories)[number];

export const auditEventSchema = z.object({
  id: z.string().min(1),
  occurredAt: isoDateTimeSchema,
  /** Machine event name, for example "approval.granted". */
  eventType: z.string().min(1),
  actorName: z.string().min(1),
  targetReference: z.string().min(1),
  action: z.string().min(1),
  /** True when the viewer may not see who or what was involved. */
  isMasked: z.boolean(),
  hashStatus: z.enum(['verified', 'mismatch']),
  siemDelivery: z.enum(['delivered', 'queued', 'failed']),
});
export type AuditEvent = z.infer<typeof auditEventSchema>;

export const auditLogPageSchema = z.object({
  items: z.array(auditEventSchema),
  nextCursor: z.string().nullable(),
  chain: z.object({
    status: z.enum(['verified', 'broken']),
    verifiedThroughAt: isoDateTimeSchema,
  }),
});
export type AuditLogPage = z.infer<typeof auditLogPageSchema>;
