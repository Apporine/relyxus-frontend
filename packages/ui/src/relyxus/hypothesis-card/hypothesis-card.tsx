import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';
import type { ConfidenceBand } from '../confidence/confidence-band';
import { ConfidenceIndicator } from '../confidence/confidence-indicator';

export const hypothesisStatuses = ['under-test', 'confirmed', 'ruled-out'] as const;
export type HypothesisStatus = (typeof hypothesisStatuses)[number];

type EvidenceCount = {
  count: number;
  /** Localised label, for example "Supporting evidence". */
  label: string;
};

type HypothesisVerdictProps =
  | {
      status: 'ruled-out';
      /** A ruled-out cause always shows the reason with the verdict (UI/UX s. 7). */
      ruledOutReason: string;
    }
  | {
      status: Exclude<HypothesisStatus, 'ruled-out'>;
      ruledOutReason?: never;
    };

export type HypothesisCardProps = HypothesisVerdictProps & {
  rank: number;
  /** Likely cause in plain words, for example "Configuration regression in payments-api". */
  cause: string;
  confidencePercent: number;
  confidenceBandLabels: Record<ConfidenceBand, string>;
  supportingEvidence: EvidenceCount;
  refutingEvidence: EvidenceCount;
  statusLabel: string;
  /** What the investigation checked. Product s. 4 requires it whenever confidence is low. */
  whatWasChecked?: { heading: string; summary: string };
  /** Links such as "Why this is ranked first" and "Open evidence". */
  actions?: ReactNode;
  className?: string;
};

function EvidenceBalance({
  supportingCount,
  refutingCount,
}: {
  supportingCount: number;
  refutingCount: number;
}) {
  const totalCount = Math.max(supportingCount + refutingCount, 1);
  return (
    <div aria-hidden className="flex flex-col gap-1.5">
      <div className="h-1.5 rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-healthy"
          style={{ inlineSize: `${(supportingCount / totalCount) * 100}%` }}
        />
      </div>
      <div className="h-1.5 rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-critical"
          style={{ inlineSize: `${(refutingCount / totalCount) * 100}%` }}
        />
      </div>
    </div>
  );
}

/** A ranked likely cause with the evidence for and against it (UI/UX s. 7 and 10.4). */
export function HypothesisCard({
  rank,
  cause,
  confidencePercent,
  confidenceBandLabels,
  supportingEvidence,
  refutingEvidence,
  status,
  statusLabel,
  ruledOutReason,
  whatWasChecked,
  actions,
  className,
}: HypothesisCardProps) {
  const isRuledOut = status === 'ruled-out';

  return (
    <article
      data-status={status}
      className={cn(
        'flex flex-col gap-3 rounded-panel border bg-surface-1 p-4',
        rank === 1 && !isRuledOut ? 'border-strong' : 'border-control',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="font-mono text-table text-fg-tertiary tabular-nums">
            {String(rank).padStart(2, '0')}
          </span>
          <h3
            className={cn(
              'text-panel-title font-semibold',
              isRuledOut ? 'text-fg-secondary line-through' : 'text-fg-primary',
            )}
          >
            {cause}
          </h3>
        </div>
        <ConfidenceIndicator
          confidencePercent={confidencePercent}
          bandLabels={confidenceBandLabels}
        />
      </header>

      <p className="text-meta font-semibold text-fg-secondary">{statusLabel}</p>
      {ruledOutReason === undefined ? null : (
        <p className="text-body text-fg-secondary">{ruledOutReason}</p>
      )}

      <dl className="flex flex-wrap gap-x-6 gap-y-1 text-meta">
        <div className="flex gap-2">
          <dt className="font-semibold text-healthy">{supportingEvidence.label}</dt>
          <dd className="text-fg-primary tabular-nums">{supportingEvidence.count}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold text-critical">{refutingEvidence.label}</dt>
          <dd className="text-fg-primary tabular-nums">{refutingEvidence.count}</dd>
        </div>
      </dl>
      <EvidenceBalance
        supportingCount={supportingEvidence.count}
        refutingCount={refutingEvidence.count}
      />

      {whatWasChecked === undefined ? null : (
        <div className="flex flex-col gap-1">
          <p className="text-meta font-semibold text-warning">{whatWasChecked.heading}</p>
          <p className="text-body text-fg-secondary">{whatWasChecked.summary}</p>
        </div>
      )}

      {actions === undefined ? null : (
        <footer className="flex flex-wrap items-center justify-between gap-3 text-table">
          {actions}
        </footer>
      )}
    </article>
  );
}
