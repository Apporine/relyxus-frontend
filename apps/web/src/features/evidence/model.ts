import {
  evidenceFreshnessStates,
  evidenceIntegrityStates,
  type EvidenceFreshness,
  type EvidenceIntegrity,
} from '@relyxus/ui';
import { z } from 'zod';

import {
  connectorHealthSchema,
  isoDateTimeSchema,
  paginatedListSchema,
} from '@/lib/domain/schemas';

/*
 * Evidence explorer data (UI/UX s. 10.5; Product s. 9). Provisional contracts until the
 * OpenAPI file is published (ADR 0004). Raw source evidence stays separate from AI text.
 */

export const evidenceFreshnessFilters = ['all', ...evidenceFreshnessStates] as const;
export type EvidenceFreshnessFilter = (typeof evidenceFreshnessFilters)[number];

export const evidenceRoles = ['supporting', 'refuting'] as const;
export type EvidenceRole = (typeof evidenceRoles)[number];

export const evidenceHypothesisLinkSchema = z.object({
  hypothesisId: z.string().min(1),
  role: z.enum(evidenceRoles),
  summary: z.string().min(1),
});
export type EvidenceHypothesisLink = z.infer<typeof evidenceHypothesisLinkSchema>;

export const evidenceSummarySchema = z.object({
  id: z.string().min(1),
  sourceName: z.string().min(1),
  sourceHealth: connectorHealthSchema.nullable(),
  title: z.string().min(1),
  capturedAt: isoDateTimeSchema,
  freshness: z.enum(evidenceFreshnessStates),
  /** Seconds since capture when freshness is stale; null when fresh. */
  staleDurationSeconds: z.number().int().nonnegative().nullable(),
  integrity: z.enum(evidenceIntegrityStates),
  /** Hypothesis ids this item supports or refutes; used for list filtering. */
  linkedHypothesisIds: z.array(z.string().min(1)),
  hypothesisLinks: z.array(evidenceHypothesisLinkSchema),
});
export type EvidenceSummary = z.infer<typeof evidenceSummarySchema>;

export const evidenceDetailSchema = evidenceSummarySchema.extend({
  query: z.string().nullable(),
  result: z.string().nullable(),
  integrityDetail: z.string().nullable(),
  redactionNotice: z.string().nullable(),
  sourceUrl: z.string().url().nullable(),
});
export type EvidenceDetail = z.infer<typeof evidenceDetailSchema>;

export const evidenceListSchema = paginatedListSchema(evidenceSummarySchema);

export type EvidenceListFilters = {
  source: string | null;
  hypothesisId: string | null;
  freshness: EvidenceFreshnessFilter;
};

export function matchesEvidenceFilters(
  item: EvidenceSummary,
  filters: EvidenceListFilters,
): boolean {
  if (filters.source !== null && item.sourceName !== filters.source) {
    return false;
  }
  if (filters.hypothesisId !== null && !item.linkedHypothesisIds.includes(filters.hypothesisId)) {
    return false;
  }
  if (filters.freshness !== 'all' && item.freshness !== filters.freshness) {
    return false;
  }
  return true;
}

export function evidenceFreshnessLabelKey(freshness: EvidenceFreshness): 'fresh' | 'stale' {
  return freshness;
}

export function evidenceIntegrityLabelKey(integrity: EvidenceIntegrity): EvidenceIntegrity {
  return integrity;
}
