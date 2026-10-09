'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { Panel } from '@/lib/ui/panel';
import { RankedBars } from '@/lib/ui/ranked-bars';
import { useSearchParamChoice } from '@/lib/ui/use-search-param-choice';

import { missDimensions, type Scorecard } from './model';

/** Misses sorted by frequency, by incident type, service or model (UI/UX s. 11.7). */
export function MissesPanel({ misses }: { misses: Scorecard['misses'] }) {
  const translateMisses = useTranslations('aiQuality.misses');
  const [dimension, selectDimension] = useSearchParamChoice('misses', missDimensions, 'type');

  return (
    <Panel title={translateMisses('title')}>
      <p className="-mt-2 text-meta text-fg-secondary">{translateMisses('description')}</p>
      <Tabs value={dimension} onValueChange={selectDimension} variant="contained">
        <TabsList aria-label={translateMisses('dimensionsLabel')}>
          {missDimensions.map((missDimension) => (
            <TabsTrigger key={missDimension} value={missDimension}>
              {translateMisses(`dimensions.${missDimension}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        {missDimensions.map((missDimension) => (
          <TabsContent key={missDimension} value={missDimension}>
            <RankedBars
              items={misses[missDimension].map((miss) => ({ key: miss.label, ...miss }))}
              emptyText={translateMisses('empty')}
            />
          </TabsContent>
        ))}
      </Tabs>
    </Panel>
  );
}
