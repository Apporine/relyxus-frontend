import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useLiveUpdateBuffer } from './use-live-update-buffer';

type IncidentRow = { id: string };

const keyOf = (row: IncidentRow) => row.id;

describe('useLiveUpdateBuffer', () => {
  it('shows the first completed load, then holds additions until revealed', () => {
    const { result, rerender } = renderHook(
      ({ items, hasLoaded }: { items: IncidentRow[]; hasLoaded: boolean }) =>
        useLiveUpdateBuffer(items, keyOf, { hasLoaded }),
      { initialProps: { items: [] as IncidentRow[], hasLoaded: false } },
    );

    rerender({ items: [{ id: 'INC-2041' }], hasLoaded: true });
    expect(result.current.visibleItems).toEqual([{ id: 'INC-2041' }]);

    rerender({ items: [{ id: 'INC-2044' }, { id: 'INC-2041' }], hasLoaded: true });
    expect(result.current.visibleItems).toEqual([{ id: 'INC-2041' }]);
    expect(result.current.pendingItems).toEqual([{ id: 'INC-2044' }]);

    act(() => result.current.revealPending());
    expect(result.current.visibleItems).toEqual([{ id: 'INC-2044' }, { id: 'INC-2041' }]);
    expect(result.current.pendingItems).toEqual([]);
  });

  it('freezes an empty first load so later arrivals still wait', () => {
    const { result, rerender } = renderHook(
      ({ items }: { items: IncidentRow[] }) =>
        useLiveUpdateBuffer(items, keyOf, { hasLoaded: true }),
      { initialProps: { items: [] as IncidentRow[] } },
    );

    rerender({ items: [{ id: 'INC-2044' }] });

    expect(result.current.visibleItems).toEqual([]);
    expect(result.current.pendingItems).toEqual([{ id: 'INC-2044' }]);
  });
});
