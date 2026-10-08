import { describe, expect, it } from 'vitest';

import { confidenceBandFor } from './confidence-band';

describe('confidenceBandFor', () => {
  it.each([
    [100, 'high'],
    [82, 'high'],
    [75, 'high'],
    [74.9, 'medium'],
    [55, 'medium'],
    [40, 'medium'],
    [39.9, 'low'],
    [31, 'low'],
    [0, 'low'],
  ] as const)('%d percent is %s confidence', (confidencePercent, expectedBand) => {
    expect(confidenceBandFor(confidencePercent)).toBe(expectedBand);
  });
});
