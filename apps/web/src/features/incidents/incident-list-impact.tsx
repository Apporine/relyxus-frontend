'use client';

import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';

import type { IncidentSummary } from './model';

/** Compact impact for list rows: money first, then customers, then a low-impact label (UI/UX s. 10.2). */
export function IncidentListImpact({ impact }: { impact: IncidentSummary['impact'] }) {
  const translateList = useTranslations('incidents.list');
  const format = useRelyxusFormat();
  const { moneyAtRisk, affectedCustomers } = impact;

  if (moneyAtRisk !== null) {
    return <span className="tabular-nums">{format.money(moneyAtRisk)}</span>;
  }
  if (affectedCustomers !== null) {
    return (
      <span className="tabular-nums">
        {translateList('impactUsers', { count: affectedCustomers })}
      </span>
    );
  }
  return <span className="text-fg-tertiary">{translateList('impactLow')}</span>;
}
