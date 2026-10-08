import { z } from 'zod';

import { isoDateTimeSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * On-call schedules and escalation (UI/UX s. 13.4; Product s. 11). Provisional until the
 * OpenAPI contract is published (ADR 0004).
 */
export const onCallScheduleSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Who is on call right now, for example "A. Rahman now". */
  currentOnCallLabel: z.string().min(1),
});
export type OnCallScheduleSummary = z.infer<typeof onCallScheduleSummarySchema>;

export const onCallScheduleListSchema = paginatedListSchema(onCallScheduleSummarySchema);

const scheduleShiftSchema = z.object({
  label: z.string().min(1),
});

export const onCallScheduleDetailSchema = onCallScheduleSummarySchema.extend({
  current: scheduleShiftSchema.nullable(),
  next: scheduleShiftSchema.nullable(),
  coverageGaps: z.array(scheduleShiftSchema),
  override: scheduleShiftSchema.nullable(),
  swapRequestsPending: z.number().int().nonnegative(),
  dstChecks: z.array(scheduleShiftSchema),
});
export type OnCallScheduleDetail = z.infer<typeof onCallScheduleDetailSchema>;

export const escalationStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  /** Null on the first step, which starts immediately. */
  delayLabel: z.string().nullable(),
  targetLabel: z.string().min(1),
  isLeadership: z.boolean(),
});
export type EscalationStep = z.infer<typeof escalationStepSchema>;

export const escalationChainSchema = z.object({
  steps: z.array(escalationStepSchema),
});
export type EscalationChain = z.infer<typeof escalationChainSchema>;
