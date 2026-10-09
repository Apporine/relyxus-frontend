import { z } from 'zod';

import { isoDateTimeSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Trust Centre (UI/UX s. 12.8; Product s. 19): customer-facing assurance documents, each
 * marked current or superseded, public or gated. Provisional contract (ADR 0004).
 */
export const trustDocumentCategories = [
  'certifications',
  'penetration-tests',
  'policies',
  'subprocessors',
  'architecture',
  'continuity',
] as const;
export type TrustDocumentCategory = (typeof trustDocumentCategories)[number];

export const trustDocumentStatuses = ['current', 'superseded', 'expired'] as const;
export type TrustDocumentStatus = (typeof trustDocumentStatuses)[number];

/** Public documents download freely; NDA documents are requested; internal ones never leave the console. */
export const trustDocumentAudiences = ['public', 'nda', 'internal'] as const;
export type TrustDocumentAudience = (typeof trustDocumentAudiences)[number];

export const trustDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(trustDocumentCategories),
  version: z.string().min(1),
  status: z.enum(trustDocumentStatuses),
  audience: z.enum(trustDocumentAudiences),
  updatedAt: isoDateTimeSchema,
  /** Present only for current public documents. */
  downloadUrl: z.string().nullable(),
  /** Documents whose changes buyers can subscribe to, such as the sub-processor list. */
  isSubscribable: z.boolean(),
});
export type TrustDocument = z.infer<typeof trustDocumentSchema>;

export const trustDocumentListSchema = paginatedListSchema(trustDocumentSchema);

export type TrustDocumentAction = 'download' | 'request-access' | 'subscribe' | 'history';

/** What a buyer can do with a document; superseded and expired material is history only. */
export function trustDocumentAction(document: TrustDocument): TrustDocumentAction {
  if (document.status !== 'current') {
    return 'history';
  }
  if (document.isSubscribable) {
    return 'subscribe';
  }
  return document.audience === 'public' ? 'download' : 'request-access';
}

export const accessRequestSchema = z.object({
  fullName: z.string().trim().min(1),
  workEmail: z.email(),
  company: z.string().trim().min(1),
  /** Gated material is shared only after the requester accepts the NDA. */
  hasAcceptedNda: z.literal(true),
});
export type AccessRequest = z.infer<typeof accessRequestSchema>;

export const accessRequestReceiptSchema = z.object({ requestId: z.string().min(1) });
