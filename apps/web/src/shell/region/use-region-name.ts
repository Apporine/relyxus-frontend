'use client';

import { useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';

/** Localised jurisdiction names from ISO 3166 codes, for example "GB" → "United Kingdom". */
export function useRegionName(): (regionCode: string) => string {
  const locale = useLocale();
  const regionNames = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale]);
  return useCallback(
    (regionCode: string) => regionNames.of(regionCode) ?? regionCode,
    [regionNames],
  );
}
