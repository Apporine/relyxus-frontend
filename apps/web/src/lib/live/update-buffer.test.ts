import { describe, expect, it } from 'vitest';

import { bufferLatestItems } from './update-buffer';

type IncidentRow = { id: string; state: string };

const keyOf = (row: IncidentRow) => row.id;

describe('bufferLatestItems', () => {
  const revealed: IncidentRow[] = [
    { id: 'INC-2041', state: 'investigating' },
    { id: 'INC-2038', state: 'mitigating' },
  ];

  it('holds new items back and keeps the revealed order', () => {
    const latest = [{ id: 'INC-2044', state: 'triage' }, ...revealed];

    expect(bufferLatestItems(revealed, latest, keyOf)).toEqual({
      visibleItems: revealed,
      pendingItems: [{ id: 'INC-2044', state: 'triage' }],
    });
  });

  it('applies updates to visible items in place', () => {
    const latest = [
      { id: 'INC-2038', state: 'monitoring' },
      { id: 'INC-2041', state: 'investigating' },
    ];

    expect(bufferLatestItems(revealed, latest, keyOf).visibleItems).toEqual([
      { id: 'INC-2041', state: 'investigating' },
      { id: 'INC-2038', state: 'monitoring' },
    ]);
  });

  it('keeps a removed item on screen until the next reveal', () => {
    const latest = [{ id: 'INC-2041', state: 'investigating' }];

    expect(bufferLatestItems(revealed, latest, keyOf).visibleItems).toEqual(revealed);
  });
});
