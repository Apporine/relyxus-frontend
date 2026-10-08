'use client';

import { SeverityBadge, Skeleton } from '@relyxus/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { ExpiryCountdown } from '@/features/approvals/expiry-countdown';
import type { PendingApproval } from '@/features/approvals/model';
import { approvalHref } from '@/features/approvals/routes';
import type { IncidentSummary } from '@/features/incidents/model';
import { incidentWarRoomHref } from '@/features/incidents/routes';
import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';

type AttentionStripProps = {
  workspaceSlug: string;
  activeIncidents: IncidentSummary[] | undefined;
  pendingApprovals: PendingApproval[] | undefined;
};

/**
 * The most severe active incident and the approval closest to expiry. It reads the latest
 * data rather than the buffered table, because no personalisation or buffering may ever hide
 * an active SEV1 or an expiring approval (UI/UX s. 10.1).
 */
function AttentionItems({ workspaceSlug, activeIncidents, pendingApprovals }: AttentionStripProps) {
  const translateAttention = useTranslations('commandCentre.attention');
  const format = useRelyxusFormat();

  if (activeIncidents === undefined || pendingApprovals === undefined) {
    return <Skeleton className="h-7 w-full" />;
  }
  const mostSevereIncident = activeIncidents.find((incident) => incident.severity === 'SEV1');
  const soonestApproval = pendingApprovals[0];
  if (mostSevereIncident === undefined && soonestApproval === undefined) {
    return <p className="text-body text-fg-secondary">{translateAttention('nothing')}</p>;
  }

  return (
    <ul className="grid gap-3 laptop:grid-cols-2 laptop:divide-x laptop:divide-divider rtl:laptop:divide-x-reverse">
      {mostSevereIncident === undefined ? null : (
        <li className="flex min-w-0 flex-wrap items-center gap-3 laptop:pe-4">
          <SeverityBadge severity={mostSevereIncident.severity} />
          <Link
            href={incidentWarRoomHref(workspaceSlug, mostSevereIncident.reference)}
            className="min-w-0 flex-1 truncate text-body font-semibold text-fg-primary hover:underline"
          >
            {mostSevereIncident.title}
          </Link>
          {mostSevereIncident.impact.moneyAtRisk === null ? null : (
            <span className="text-table font-semibold text-critical tabular-nums">
              {translateAttention('moneyAtRisk', {
                amount: format.money(mostSevereIncident.impact.moneyAtRisk),
              })}
            </span>
          )}
        </li>
      )}
      {soonestApproval === undefined ? null : (
        <li className="flex min-w-0 flex-wrap items-center gap-3 laptop:ps-4">
          <span className="inline-flex h-6 items-center rounded-full border border-warning px-2.5 text-meta font-semibold text-warning uppercase">
            {translateAttention('approval')}
          </span>
          <Link
            href={approvalHref(workspaceSlug, soonestApproval.id)}
            className="min-w-0 flex-1 truncate text-body font-semibold text-fg-primary hover:underline"
          >
            {soonestApproval.title}
          </Link>
          <ExpiryCountdown expiresAt={new Date(soonestApproval.expiresAt)} />
        </li>
      )}
    </ul>
  );
}

export function AttentionStrip(props: AttentionStripProps) {
  const translateAttention = useTranslations('commandCentre.attention');

  return (
    <section
      aria-labelledby="attention-heading"
      className="flex flex-col gap-3 rounded-panel border border-control bg-surface-1 px-5 py-4"
    >
      <h2 id="attention-heading" className="text-meta font-semibold text-fg-secondary uppercase">
        {translateAttention('heading')}
      </h2>
      <AttentionItems {...props} />
    </section>
  );
}
