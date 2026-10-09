import { z } from 'zod';

import { isoDateTimeSchema, paginatedListSchema } from '@/lib/domain/schemas';

/*
 * Administration screens (UI/UX s. 12.6, 13.5 to 13.9; Product s. 6A, 11, 14, 14A, 17).
 * Values that are configuration names (identity providers, regions, scopes) arrive as data;
 * every label and state word is localised. Provisional contracts (ADR 0004).
 */

// Status pages (UI/UX s. 12.6)
export const statusPageAudiences = ['public', 'sign-in', 'employees'] as const;
export const componentStates = ['operational', 'degraded', 'outage'] as const;

export const statusPageSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  audience: z.enum(statusPageAudiences),
  activeIncidentCount: z.number().int().nonnegative(),
});
export const statusPageListSchema = paginatedListSchema(statusPageSummarySchema);

export const statusPageDetailSchema = statusPageSummarySchema.extend({
  state: z.enum(componentStates),
  subscriberCount: z.number().int().nonnegative(),
  isSyncReady: z.boolean(),
  draftUpdate: z
    .object({
      title: z.string().min(1),
      message: z.string().min(1),
      nextUpdateAt: isoDateTimeSchema,
      components: z.array(z.string().min(1)),
      isApprovalRequired: z.boolean(),
    })
    .nullable(),
});
export type StatusPageDetail = z.infer<typeof statusPageDetailSchema>;

// Configuration promotion (UI/UX s. 13.5; Product s. 14A)
export const promotionSummarySchema = z.object({
  id: z.string().min(1),
  sourceName: z.string().min(1),
  targetName: z.string().min(1),
});
export const promotionListSchema = paginatedListSchema(promotionSummarySchema);

export const promotionDetailSchema = promotionSummarySchema.extend({
  counts: z.object({
    added: z.number().int().nonnegative(),
    changed: z.number().int().nonnegative(),
    deleted: z.number().int().nonnegative(),
    /** Secrets are never promoted; they are re-entered in the target. */
    secretsOmitted: z.number().int().nonnegative(),
  }),
  differences: z.array(
    z.object({
      area: z.string().min(1),
      summary: z.string().min(1),
      kind: z.enum(['added', 'changed', 'deleted']),
    }),
  ),
  managedByCodeCount: z.number().int().nonnegative(),
  validation: z.object({
    isSchemaValid: z.boolean(),
    missingDependencyCount: z.number().int().nonnegative(),
    destructiveChangeCount: z.number().int().nonnegative(),
    isApprovalRequired: z.boolean(),
  }),
});
export type PromotionDetail = z.infer<typeof promotionDetailSchema>;

// Platform operations (UI/UX s. 13.6; Product s. 6A)
export const checkStatuses = ['healthy', 'warning', 'failing'] as const;
export type CheckStatus = (typeof checkStatuses)[number];

export const platformOperationsSchema = z.object({
  version: z.string().min(1),
  isCurrentVersion: z.boolean(),
  nodeCount: z.number().int().positive(),
  clusterStatus: z.enum(checkStatuses),
  capacityPercent: z.number().min(0).max(100),
  projectedCapacityPercent: z.number().min(0).max(100),
  lastVerifiedBackupAt: isoDateTimeSchema,
  certificateExpiresAt: isoDateTimeSchema,
  checks: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      status: z.enum(checkStatuses),
      detail: z.string().min(1),
    }),
  ),
  availableUpdate: z
    .object({
      version: z.string().min(1),
      isPreflightRequired: z.boolean(),
      estimatedMinutes: z.number().int().positive(),
      isRollbackSupported: z.boolean(),
    })
    .nullable(),
});
export type PlatformOperations = z.infer<typeof platformOperationsSchema>;

// Support access (UI/UX s. 13.7; Product s. 17)
export const supportSessionStates = ['requested', 'active', 'closed', 'denied'] as const;

export const supportSessionSummarySchema = z.object({
  id: z.string().min(1),
  reference: z.string().min(1),
  state: z.enum(supportSessionStates),
  expiresAt: isoDateTimeSchema.nullable(),
});
export const supportSessionListSchema = paginatedListSchema(supportSessionSummarySchema);

export const supportSessionDetailSchema = supportSessionSummarySchema.extend({
  reason: z.string().min(1),
  scope: z.string().min(1),
  dataClasses: z.string().min(1),
  approvals: z.string().min(1),
  observerName: z.string().nullable(),
  /** Why the request was refused, for denied sessions. */
  denialReason: z.string().nullable(),
  isActionLogStreaming: z.boolean(),
  isSessionReportEnabled: z.boolean(),
});
export type SupportSessionDetail = z.infer<typeof supportSessionDetailSchema>;

// Users, teams and roles (UI/UX s. 13.8; Product s. 14)
export const userStatuses = ['active', 'invited', 'suspended'] as const;

export const userSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(userStatuses),
  primaryTeamName: z.string().nullable(),
});
export const userListSchema = paginatedListSchema(userSummarySchema);

export const userDetailSchema = userSummarySchema.extend({
  identitySource: z.string().min(1),
  teams: z.array(z.string().min(1)),
  roles: z.array(z.string().min(1)),
  lastSignInAt: isoDateTimeSchema.nullable(),
  activeSessionCount: z.number().int().nonnegative(),
  isDirectoryManaged: z.boolean(),
  delegatedApprovalsTo: z.string().nullable(),
  accessReview: z.enum(['current', 'due', 'overdue']),
  hasBreakGlassAccess: z.boolean(),
});
export type UserDetail = z.infer<typeof userDetailSchema>;

// Security and data controls (UI/UX s. 13.9; Product s. 17)
export const securitySectionIds = [
  'sso-mfa',
  'encryption',
  'data-policy',
  'models-regions',
  'support-access',
  'audit-siem',
] as const;
export type SecuritySectionId = (typeof securitySectionIds)[number];

export const securitySettingKeys = [
  'primary-model-route',
  'fallback-route',
  'data-residency',
  'external-model-egress',
  'input-retention',
  'training-use',
  'identity-provider',
  'mfa',
  'key-management',
  'key-rotation',
  'retention',
  'redaction',
  'support-approval',
  'support-duration',
  'siem-destination',
  'siem-delivery',
] as const;

export const dataFlowKeys = [
  'boundary',
  'vendor-egress',
  'restricted-incidents',
  'support-visibility',
] as const;

export const securitySectionSummarySchema = z.object({
  id: z.enum(securitySectionIds),
  summary: z.string().min(1),
});
export const securitySectionListSchema = paginatedListSchema(securitySectionSummarySchema);

export const securitySectionDetailSchema = securitySectionSummarySchema.extend({
  settings: z.array(z.object({ key: z.enum(securitySettingKeys), value: z.string().min(1) })),
  dataFlow: z.array(z.object({ key: z.enum(dataFlowKeys), value: z.string().min(1) })),
});
export type SecuritySectionDetail = z.infer<typeof securitySectionDetailSchema>;
