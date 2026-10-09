import type { AuditEvent, AuditLogPage } from '@/features/audit/model';

/*
 * DEVELOPMENT FIXTURE. Audit ledger for the Payments / UK demo (Figma frame 35). The event
 * about the restricted incident arrives masked, as the server sends it to this viewer.
 */

const MILLISECONDS_PER_SECOND = 1_000;
const secondsAgo = (seconds: number) =>
  new Date(Date.now() - seconds * MILLISECONDS_PER_SECOND).toISOString();

type CategorisedAuditEvent = AuditEvent & { category: string };

function auditEventFixtures(): CategorisedAuditEvent[] {
  return [
    {
      id: 'audit-7',
      category: 'support',
      occurredAt: secondsAgo(12.2),
      eventType: 'support.session.read',
      actorName: 'vendor-sre-18',
      targetReference: 'SUP-8821',
      action: 'diagnostics.read',
      isMasked: false,
      hashStatus: 'verified',
      siemDelivery: 'delivered',
    },
    {
      id: 'audit-6',
      category: 'approval',
      occurredAt: secondsAgo(109.3),
      eventType: 'approval.granted',
      actorName: 'a.rahman',
      targetReference: 'ACT-7721',
      action: 'Restart approved',
      isMasked: false,
      hashStatus: 'verified',
      siemDelivery: 'delivered',
    },
    {
      id: 'audit-5',
      category: 'policy',
      occurredAt: secondsAgo(135.7),
      eventType: 'policy.evaluated',
      actorName: 'system',
      targetReference: 'payments-api',
      action: 'L1 suggest',
      isMasked: false,
      hashStatus: 'verified',
      siemDelivery: 'delivered',
    },
    {
      id: 'audit-4',
      category: 'incident',
      occurredAt: secondsAgo(237.1),
      eventType: 'incident.updated',
      actorName: 'sara.malik',
      targetReference: 'INC-2041',
      action: 'Commander set',
      isMasked: false,
      hashStatus: 'verified',
      siemDelivery: 'delivered',
    },
    {
      id: 'audit-3',
      category: 'report',
      occurredAt: secondsAgo(330.4),
      eventType: 'report.draft',
      actorName: 'relyxus-ai',
      targetReference: 'RPT-1128',
      action: 'DORA draft',
      isMasked: false,
      hashStatus: 'verified',
      siemDelivery: 'queued',
    },
    {
      id: 'audit-2',
      category: 'action',
      occurredAt: secondsAgo(376.8),
      eventType: 'action.proposed',
      actorName: 'relyxus-ai',
      targetReference: 'ACT-7721',
      action: 'Restart payments-api',
      isMasked: false,
      hashStatus: 'verified',
      siemDelivery: 'delivered',
    },
    {
      id: 'audit-1',
      category: 'incident',
      occurredAt: secondsAgo(469.2),
      eventType: 'restricted.event',
      actorName: 'masked',
      targetReference: 'masked',
      action: 'masked',
      isMasked: true,
      hashStatus: 'verified',
      siemDelivery: 'delivered',
    },
  ];
}

export function auditLogPageFor(workspaceSlug: string, category: string | null): AuditLogPage {
  const events =
    workspaceSlug === 'payments-uk'
      ? auditEventFixtures().filter((event) => category === null || event.category === category)
      : [];
  return {
    items: events.map((event) => ({
      id: event.id,
      occurredAt: event.occurredAt,
      eventType: event.eventType,
      actorName: event.actorName,
      targetReference: event.targetReference,
      action: event.action,
      isMasked: event.isMasked,
      hashStatus: event.hashStatus,
      siemDelivery: event.siemDelivery,
    })),
    nextCursor: null,
    chain: { status: 'verified', verifiedThroughAt: secondsAgo(12.2) },
  };
}
