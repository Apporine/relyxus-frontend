/*
 * Money is stored as an integer amount in the currency's minor unit plus its ISO 4217 code
 * (Product s. 14), and shown with the currency code rather than a symbol so currencies are
 * never confused: "AED 48,200" (UI/UX s. 16).
 */

export type MoneyAmount = {
  /** Integer amount in the currency's minor unit, for example fils for AED. */
  amountInMinorUnits: number;
  /** ISO 4217 currency code. */
  currencyCode: string;
};

function minorUnitDigitsOf(currencyCode: string): number {
  return (
    new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode }).resolvedOptions()
      .maximumFractionDigits ?? 2
  );
}

/** Whole-unit display for impact figures, for example "AED 48,200". */
export function formatMoney(
  { amountInMinorUnits, currencyCode }: MoneyAmount,
  formattingLocale: string,
): string {
  const majorUnitAmount = amountInMinorUnits / 10 ** minorUnitDigitsOf(currencyCode);
  return new Intl.NumberFormat(formattingLocale, {
    style: 'currency',
    currency: currencyCode,
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  }).format(majorUnitAmount);
}

/** Abbreviated counts for cards only, for example "12.4k"; tables and reports use full values. */
export function formatCompactCount(count: number, formattingLocale: string): string {
  return new Intl.NumberFormat(formattingLocale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(count);
}
