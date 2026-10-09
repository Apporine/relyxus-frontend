import type { Route } from 'next';
import Link from 'next/link';

export type RankedBarItem = { key: string; label: string; count: number; href?: Route };

/** Counts as proportional bars, largest first, each with its number written out. */
export function RankedBars({
  items,
  emptyText,
}: {
  items: readonly RankedBarItem[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return <p className="text-body text-fg-secondary">{emptyText}</p>;
  }
  const sortedItems = items.toSorted((first, second) => second.count - first.count);
  const largestCount = sortedItems[0]?.count ?? 1;

  return (
    <ul className="flex flex-col gap-3">
      {sortedItems.map((item) => (
        <li
          key={item.key}
          className="grid grid-cols-[minmax(7rem,10rem)_1fr_auto] items-center gap-3"
        >
          {item.href === undefined ? (
            <span className="truncate text-table">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="truncate text-table underline-offset-2 hover:underline"
            >
              {item.label}
            </Link>
          )}
          <span aria-hidden className="h-2 rounded-full bg-surface-2">
            <span
              className="block h-full rounded-full bg-fg-secondary"
              style={{ width: `${(item.count / largestCount) * 100}%` }}
            />
          </span>
          <span className="text-table font-semibold tabular-nums">{item.count}</span>
        </li>
      ))}
    </ul>
  );
}
