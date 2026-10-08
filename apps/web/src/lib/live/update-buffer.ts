/*
 * "Never move what someone is reading" (UI/UX principle 11). Items already on screen keep
 * their position and receive in-place updates; new items wait behind an "N new updates"
 * pill until the person chooses to reveal them, and removals also wait for that moment so
 * rows never disappear from under the reader.
 */

export type BufferedList<Item> = {
  /** What is on screen: the previously revealed order with each item's latest data. */
  visibleItems: Item[];
  /** Items that arrived since the last reveal and are not yet shown. */
  pendingItems: Item[];
};

export function bufferLatestItems<Item>(
  revealedItems: readonly Item[],
  latestItems: readonly Item[],
  keyOf: (item: Item) => string,
): BufferedList<Item> {
  const latestByKey = new Map(latestItems.map((item) => [keyOf(item), item]));
  const revealedKeys = new Set(revealedItems.map(keyOf));

  return {
    visibleItems: revealedItems.map((item) => latestByKey.get(keyOf(item)) ?? item),
    pendingItems: latestItems.filter((item) => !revealedKeys.has(keyOf(item))),
  };
}
