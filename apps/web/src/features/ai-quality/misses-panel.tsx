'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { Panel } from '@/lib/ui/panel';
import { useSearchParamChoice } from '@/lib/ui/use-search-param-choice';

import { missDimensions, type MissCount, type Scorecard } from './model';

function MissBars({ misses, emptyText }: { misses: readonly MissCount[]; emptyText: string }) {
  if (misses.length === 0) {
    return <p className="text-body text-fg-secondary">{emptyText}</p>;
  }
  const sortedMisses = misses.toSorted((first, second) => second.count - first.count);
  const largestCount = sortedMisses[0]?.count ?? 1;

  return (
    <ul className="flex flex-col gap-3">
      {sortedMisses.map((miss) => (
        <li
          key={miss.label}
          className="grid grid-cols-[minmax(7rem,10rem)_1fr_auto] items-center gap-3"
        >
          <span className="truncate text-table">{miss.label}</span>
          <span aria-hidden className="h-2 rounded-full bg-surface-2">
            <span
              className="block h-full rounded-full bg-fg-secondary"
              style={{ width: `${(miss.count / largestCount) * 100}%` }}
            />
          </span>
          <span className="text-table font-semibold tabular-nums">{miss.count}</span>
        </li>
      ))}
    </ul>
  );
}

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
            <MissBars misses={misses[missDimension]} emptyText={translateMisses('empty')} />
          </TabsContent>
        ))}
      </Tabs>
    </Panel>
  );
}
