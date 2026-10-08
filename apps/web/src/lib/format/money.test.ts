import { describe, expect, it } from 'vitest';

import { formatCompactCount, formatMoney } from './money';

describe('formatMoney', () => {
  it('shows the currency code with whole units', () => {
    expect(formatMoney({ amountInMinorUnits: 4_820_000, currencyCode: 'AED' }, 'en-GB')).toMatch(
      /^AED\s48,200$/,
    );
  });

  it('respects currencies without minor units', () => {
    expect(formatMoney({ amountInMinorUnits: 184_000, currencyCode: 'JPY' }, 'en-GB')).toMatch(
      /^JPY\s184,000$/,
    );
  });

  it('respects currencies with three minor digits', () => {
    expect(formatMoney({ amountInMinorUnits: 12_500_000, currencyCode: 'BHD' }, 'en-GB')).toMatch(
      /^BHD\s12,500$/,
    );
  });

  it('keeps Western digits in Arabic', () => {
    expect(
      formatMoney({ amountInMinorUnits: 4_820_000, currencyCode: 'AED' }, 'ar-u-nu-latn'),
    ).toContain('48,200');
  });
});

describe('formatCompactCount', () => {
  it('abbreviates large counts for cards', () => {
    expect(formatCompactCount(12_400, 'en-GB')).toBe('12.4k');
  });
});
