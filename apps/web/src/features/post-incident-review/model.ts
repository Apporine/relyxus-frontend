import { z } from 'zod';

import { isoDateTimeSchema, severitySchema } from '@/lib/domain/schemas';

/*
 * Post-incident review (UI/UX s. 12.4; Product s. 10 and 13). Each section says whether the
 * AI wrote it or a person edited it. A SEV1 review cannot be completed until every required
 * reviewer has signed. Provisional contract (ADR 0004).
 */
export const sectionAuthorships = ['ai-generated', 'human-edited', 'mixed', 'pending'] as const;
export type SectionAuthorship = (typeof sectionAuthorships)[number];

export const postIncidentReviewSchema = z.object({
  incidentReference: z.string().min(1),
  incidentTitle: z.string().min(1),
  severity: severitySchema,
  dueAt: isoDateTimeSchema,
  state: z.enum(['draft', 'in-review', 'approved', 'published', 'closed']),
  sections: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      authorship: z.enum(sectionAuthorships),
      /** Null while the section has not been written. */
      content: z.string().nullable(),
    }),
  ),
  reviewers: z.array(
    z.object({
      name: z.string().min(1),
      role: z.string().min(1),
      signedAt: isoDateTimeSchema.nullable(),
    }),
  ),
});
export type PostIncidentReview = z.infer<typeof postIncidentReviewSchema>;
