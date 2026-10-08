'use client';

import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';

import type { IncidentSummary } from './model';

/**
 * Business impact first (Product s. 5): money at risk with its confidence, then failed
 * transactions, then customers affected. A value that was not measured says so.
 */
export function IncidentImpact({ impact }: { impact: IncidentSummary['impact'] }) {
  const translateImpact = useTranslations('incidents.impact');
  const translateConfidence = useTranslations('domain.impactConfidence');
  const format = useRelyxusFormat();
  const { moneyAtRisk, failedTransactions, affectedCustomers } = impact;

  if (moneyAtRisk === null && failedTransactions === null && affectedCustomers === null) {
    return <span className="text-fg-tertiary">{translateImpact('notMeasured')}</span>;
  }

  return (
    <span className="flex flex-col">
      {moneyAtRisk === null ? null : (
        <span className="font-semibold text-fg-primary tabular-nums">
          {format.money(moneyAtRisk)}
          {moneyAtRisk.confidence === 'measured' ? null : (
            <span className="ms-1.5 text-meta font-normal text-fg-tertiary">
              {translateConfidence(moneyAtRisk.confidence)}
            </span>
          )}
        </span>
      )}
      {failedTransactions === null ? null : (
        <span className="text-meta text-fg-secondary">
          {translateImpact('failedTransactions', { count: failedTransactions })}
        </span>
      )}
      {failedTransactions === null && affectedCustomers !== null ? (
        <span className="text-meta text-fg-secondary">
          {translateImpact('affectedCustomers', { count: affectedCustomers })}
        </span>
      ) : null}
    </span>
  );
}
