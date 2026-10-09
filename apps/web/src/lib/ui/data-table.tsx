'use client';

import { cn } from '@relyxus/ui';
import type { ReactNode } from 'react';

export type DataTableColumn<Row> = {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  /** The column that names the row; announced as the row header. */
  isRowHeader?: boolean;
  className?: string;
};

type DataTableProps<Row> = {
  /** Names the table for assistive technology; also labels its scroll region. */
  caption: string;
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  getRowKey: (row: Row) => string;
  emptyText: string;
  /** Narrow screens scroll the table sideways instead of squeezing its columns. */
  minWidthClassName?: string;
};

/**
 * A read-only operational table: semantic headers, a caption, and a keyboard-scrollable
 * region on narrow screens (WCAG 2.2 scrollable-region-focusable).
 */
export function DataTable<Row>({
  caption,
  columns,
  rows,
  getRowKey,
  emptyText,
  minWidthClassName = 'min-w-[48rem]',
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return <p className="text-body text-fg-secondary">{emptyText}</p>;
  }
  return (
    // Focusable so the table can be scrolled sideways from the keyboard.
    <div role="region" aria-label={caption} tabIndex={0} className="overflow-x-auto">
      <table className={cn('w-full text-table', minWidthClassName)}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-meta text-fg-tertiary uppercase">
            {columns.map((column) => (
              <th key={column.key} scope="col" className="pe-4 pb-2 text-start font-semibold">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="border-t border-divider align-top">
              {columns.map((column) =>
                column.isRowHeader === true ? (
                  <th
                    key={column.key}
                    scope="row"
                    className={cn('py-3 pe-4 text-start font-semibold', column.className)}
                  >
                    {column.render(row)}
                  </th>
                ) : (
                  <td key={column.key} className={cn('py-3 pe-4', column.className)}>
                    {column.render(row)}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
