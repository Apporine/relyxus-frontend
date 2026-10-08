'use client';

import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { requestApi } from '@/lib/api/http-client';

import { navigationAreaIds } from '../navigation/navigation-model';

/*
 * Who is signed in and which workspaces they may enter. Provisional contract derived from
 * Product s. 14 and 20 (Organisation, Workspace, User) until the OpenAPI file exists
 * (ADR 0004). The server decides `accessibleAreas`; the console only reflects it.
 */

export const deploymentModes = ['saas', 'dedicated', 'self-hosted', 'air-gapped'] as const;
export type DeploymentMode = (typeof deploymentModes)[number];

export const workspaceSummarySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  /** ISO 3166-1 alpha-2 code of the jurisdiction where the workspace's data lives. */
  dataRegionCode: z.string().length(2),
  deploymentMode: z.enum(deploymentModes),
  accessibleAreas: z.array(z.enum(navigationAreaIds)),
});
export type WorkspaceSummary = z.infer<typeof workspaceSummarySchema>;

export const sessionSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    displayName: z.string().min(1),
    email: z.email(),
  }),
  workspaces: z.array(workspaceSummarySchema),
});
export type Session = z.infer<typeof sessionSchema>;

export const sessionQueryKey = ['session'] as const;

export function useSession() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: async ({ signal }) =>
      (await requestApi({ path: '/me', responseSchema: sessionSchema, signal })).data,
  });
}
