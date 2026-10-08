import { EyeOff } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { ConnectorHealthBadge } from '../badges/incident-badges';
import { StatusPill, type StatusPillProps } from '../badges/status-pill';
import type { ConnectorHealth } from '../vocabulary';

export const evidenceIntegrityStates = ['verified', 'mismatch', 'pending'] as const;
export type EvidenceIntegrity = (typeof evidenceIntegrityStates)[number];

export const evidenceFreshnessStates = ['fresh', 'stale'] as const;
export type EvidenceFreshness = (typeof evidenceFreshnessStates)[number];

const integrityTones = {
  verified: 'healthy',
  mismatch: 'critical',
  pending: 'neutral',
} satisfies Record<EvidenceIntegrity, StatusPillProps['tone']>;

type LabelledValue<Value extends string> = {
  value: Value;
  /** Localised word, for example "Hash verified" or "Stale". */
  label: string;
};

export type EvidenceItemProps = {
  /** Source and subject, for example "Prometheus · payments error rate". */
  title: string;
  /** Exact query or reference that produced the result; always shown left-to-right. */
  query?: string;
  /** App-formatted capture time with its zone, for example "Captured 12:04:31 UTC". */
  capturedAtText: string;
  freshness: LabelledValue<EvidenceFreshness>;
  integrity: LabelledValue<EvidenceIntegrity>;
  /** Present when the source connector is not healthy, so degraded evidence is never hidden. */
  connectorHealth?: LabelledValue<ConnectorHealth>;
  /** Localised notice shown when sensitive values were redacted before storage. */
  redactionNotice?: string;
  actions?: ReactNode;
  className?: string;
};

/** Source, query, capture time, freshness, connector health, redaction and hash status. */
export function EvidenceItem({
  title,
  query,
  capturedAtText,
  freshness,
  integrity,
  connectorHealth,
  redactionNotice,
  actions,
  className,
}: EvidenceItemProps) {
  return (
    <article
      className={cn(
        'flex flex-col gap-2 rounded-panel border bg-surface-1 p-4',
        integrity.value === 'mismatch' ? 'border-critical' : 'border-control',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-body font-semibold text-fg-primary">{title}</h3>
        <div className="flex flex-wrap gap-2">
          {connectorHealth === undefined ? null : (
            <ConnectorHealthBadge health={connectorHealth.value} label={connectorHealth.label} />
          )}
          {freshness.value === 'stale' ? (
            <StatusPill tone="warning">{freshness.label}</StatusPill>
          ) : null}
          <StatusPill tone={integrityTones[integrity.value]}>{integrity.label}</StatusPill>
        </div>
      </header>
      {query === undefined ? null : (
        <code
          dir="ltr"
          className="block overflow-x-auto font-mono text-table whitespace-pre text-fg-secondary"
        >
          {query}
        </code>
      )}
      <p className="text-meta text-fg-tertiary">
        {capturedAtText}
        {freshness.value === 'fresh' ? ` · ${freshness.label}` : null}
      </p>
      {redactionNotice === undefined ? null : (
        <p className="flex items-center gap-1.5 text-meta text-fg-secondary">
          <EyeOff aria-hidden className="size-3.5" />
          {redactionNotice}
        </p>
      )}
      {actions === undefined ? null : (
        <footer className="flex flex-wrap gap-3 pt-1">{actions}</footer>
      )}
    </article>
  );
}
