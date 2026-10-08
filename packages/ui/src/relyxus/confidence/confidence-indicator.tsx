import { StatusPill } from '../badges/status-pill';
import { confidenceBandFor, type ConfidenceBand } from './confidence-band';

export type ConfidenceIndicatorProps = {
  /** Calibrated confidence from 0 to 100. */
  confidencePercent: number;
  /** Localised band words, for example { high: 'High', medium: 'Medium', low: 'Low' }. */
  bandLabels: Record<ConfidenceBand, string>;
  className?: string;
};

/**
 * Percentage plus band. Low confidence is drawn in the warning colour; the card that uses it
 * must also show what was checked and ruled out (UI/UX s. 7).
 */
export function ConfidenceIndicator({
  confidencePercent,
  bandLabels,
  className,
}: ConfidenceIndicatorProps) {
  const band = confidenceBandFor(confidencePercent);
  return (
    <StatusPill tone={band === 'low' ? 'warning' : 'neutral'} className={className}>
      <bdi className="tabular-nums">{Math.round(confidencePercent)}%</bdi>
      {bandLabels[band]}
    </StatusPill>
  );
}
