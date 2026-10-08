'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { requestApi } from '@/lib/api/http-client';

/*
 * Relyxus reports its own health separately from customer systems (Product s. 6A and 21;
 * contract s. 49), with the capabilities that still work while degraded (UI/UX s. 9).
 * Provisional contract until the OpenAPI file exists (ADR 0004).
 */

export const platformHealthStates = ['healthy', 'degraded', 'down'] as const;
export type PlatformHealth = (typeof platformHealthStates)[number];

export const platformCapabilities = [
  'alert-intake',
  'investigations',
  'ai-reasoning',
  'approvals',
  'notifications',
  'integrations',
] as const;
export type PlatformCapability = (typeof platformCapabilities)[number];

export const capabilityStates = ['working', 'delayed', 'down'] as const;
export type CapabilityState = (typeof capabilityStates)[number];

const platformNoticeSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('licence-grace'),
    id: z.string(),
    /** End of the 30-day grace period (Product s. 6A). */
    graceEndsAt: z.iso.datetime({ offset: true }),
  }),
  z.object({
    kind: z.literal('planned-maintenance'),
    id: z.string(),
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
  }),
]);
export type PlatformNotice = z.infer<typeof platformNoticeSchema>;

export const platformStatusSchema = z.object({
  health: z.enum(platformHealthStates),
  capabilities: z.array(
    z.object({
      capability: z.enum(platformCapabilities),
      state: z.enum(capabilityStates),
    }),
  ),
  notices: z.array(platformNoticeSchema),
});
export type PlatformStatus = z.infer<typeof platformStatusSchema>;

export const platformStatusQueryKey = ['platform-status'] as const;

/** Live event that tells the console to re-read platform status (provisional name, ADR 0004). */
export const PLATFORM_STATUS_CHANGED_EVENT = 'platform.status.changed.v1';

/** Refreshed when the live connection reports a change, never by polling (contract s. 25). */
export function usePlatformStatus() {
  return useQuery({
    queryKey: platformStatusQueryKey,
    queryFn: async ({ signal }) =>
      (await requestApi({ path: '/platform/status', responseSchema: platformStatusSchema, signal }))
        .data,
  });
}
