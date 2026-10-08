'use client';

import { useCallback, useState } from 'react';

import { bufferLatestItems, type BufferedList } from './update-buffer';

export type LiveUpdateBuffer<Item> = BufferedList<Item> & {
  /** Inserts pending items and applies removals: the person chose to see the new state. */
  revealPending: () => void;
};

/**
 * Holds a live list still while it is being read. Everything present when the first load
 * completes is shown at once; later additions wait in `pendingItems`.
 */
export function useLiveUpdateBuffer<Item>(
  latestItems: readonly Item[],
  keyOf: (item: Item) => string,
  { hasLoaded }: { hasLoaded: boolean },
): LiveUpdateBuffer<Item> {
  const [revealedItems, setRevealedItems] = useState<readonly Item[] | null>(null);

  // Adjusting state while rendering, as React documents for deriving from props: the first
  // completed load becomes the revealed snapshot without an extra effect pass.
  if (hasLoaded && revealedItems === null) {
    setRevealedItems(latestItems);
  }

  const revealPending = useCallback(() => setRevealedItems(latestItems), [latestItems]);
  const bufferedList = bufferLatestItems(revealedItems ?? latestItems, latestItems, keyOf);

  return { ...bufferedList, revealPending };
}
