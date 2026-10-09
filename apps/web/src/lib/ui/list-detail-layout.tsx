'use client';

import { cn } from '@relyxus/ui';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Panel } from './panel';
import { useMediaQuery } from './use-media-query';

/** The Obsidian frames place list, detail and summary side by side from 1440 px. */
const THREE_COLUMN_MEDIA_QUERY = '(min-width: 90rem)';

export function ListDetailLayout({
  list,
  detail,
  aside,
}: {
  list: ReactNode;
  detail: ReactNode;
  aside?: ReactNode;
}) {
  const showsThreeColumns = useMediaQuery(THREE_COLUMN_MEDIA_QUERY);
  return (
    <div
      className={
        showsThreeColumns
          ? 'grid grid-cols-[minmax(17rem,320px)_minmax(0,1fr)_minmax(15rem,270px)] items-start gap-6'
          : 'flex flex-col gap-6'
      }
    >
      {list}
      {detail}
      {aside}
    </div>
  );
}

export type SelectableListItem = {
  id: string;
  title: string;
  /** Second line, for example "L1 Suggest · Published". */
  meta: ReactNode;
};

/** The left column: items as links, the selected one marked for assistive technology. */
export function SelectableListPanel({
  title,
  items,
  selectedId,
  hrefFor,
  emptyText,
}: {
  title: string;
  items: readonly SelectableListItem[];
  selectedId: string | null;
  hrefFor: (id: string) => Route;
  emptyText: string;
}) {
  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <p className="text-body text-fg-secondary">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <li key={item.id}>
                <Link
                  href={hrefFor(item.id)}
                  replace
                  scroll={false}
                  aria-current={isSelected ? 'true' : undefined}
                  className={cn(
                    'flex flex-col gap-1 rounded-panel border p-3 transition-colors hover:bg-surface-2',
                    isSelected ? 'border-strong bg-selected' : 'border-divider',
                  )}
                >
                  <span className="text-body font-semibold text-fg-primary">{item.title}</span>
                  <span className="text-meta text-fg-secondary">{item.meta}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
