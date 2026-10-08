/*
 * Confidence bands from UI/UX s. 16 ("AI wording"): High is 75 percent and above, Medium is
 * 40 to 74 percent, Low is below 40 percent. Low confidence must always show what was checked.
 */

export const confidenceBands = ['high', 'medium', 'low'] as const;
export type ConfidenceBand = (typeof confidenceBands)[number];

const HIGH_CONFIDENCE_MINIMUM_PERCENT = 75;
const MEDIUM_CONFIDENCE_MINIMUM_PERCENT = 40;

export function confidenceBandFor(confidencePercent: number): ConfidenceBand {
  if (confidencePercent >= HIGH_CONFIDENCE_MINIMUM_PERCENT) {
    return 'high';
  }
  if (confidencePercent >= MEDIUM_CONFIDENCE_MINIMUM_PERCENT) {
    return 'medium';
  }
  return 'low';
}
