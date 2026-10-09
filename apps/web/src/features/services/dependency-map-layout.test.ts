import { describe, expect, it } from 'vitest';

import {
  FOCUS_NODE_ID,
  layoutDependencyMap,
  MAX_NEIGHBOURS_PER_SIDE,
  neighboursByAttention,
} from './dependency-map-layout';
import type { DependencyNeighbour, ServiceHealth } from './model';

const focusService = { id: 'payments-api', name: 'payments-api', health: 'at-risk' as const };

function neighbour(id: string, health: ServiceHealth = 'healthy'): DependencyNeighbour {
  return { id, name: id, kind: 'service', health, dependencyType: 'calls' };
}

function neighbours(count: number): DependencyNeighbour[] {
  return Array.from({ length: count }, (_, index) => neighbour(`service-${index + 10}`));
}

describe('layoutDependencyMap', () => {
  it('places what depends on the service at the inline start and what it depends on at the end', () => {
    const layout = layoutDependencyMap(
      focusService,
      { dependents: [neighbour('checkout-web')], dependencies: [neighbour('postgres-pay')] },
      'ltr',
    );

    const positions = Object.fromEntries(layout.nodes.map((node) => [node.id, node.position.x]));
    expect(positions[FOCUS_NODE_ID]).toBe(0);
    expect(positions['dependents:checkout-web']).toBeLessThan(0);
    expect(positions['dependencies:postgres-pay']).toBeGreaterThan(0);
  });

  it('mirrors the sides in right-to-left layouts', () => {
    const layout = layoutDependencyMap(
      focusService,
      { dependents: [neighbour('checkout-web')], dependencies: [neighbour('postgres-pay')] },
      'rtl',
    );

    const positions = Object.fromEntries(layout.nodes.map((node) => [node.id, node.position.x]));
    expect(positions['dependents:checkout-web']).toBeGreaterThan(0);
    expect(positions['dependencies:postgres-pay']).toBeLessThan(0);
  });

  it('points every edge from the service that depends to the one it depends on', () => {
    const layout = layoutDependencyMap(
      focusService,
      { dependents: [neighbour('checkout-web')], dependencies: [neighbour('postgres-pay')] },
      'ltr',
    );

    expect(layout.edges).toEqual([
      {
        id: `dependents:checkout-web->${FOCUS_NODE_ID}`,
        sourceId: 'dependents:checkout-web',
        targetId: FOCUS_NODE_ID,
      },
      {
        id: `${FOCUS_NODE_ID}->dependencies:postgres-pay`,
        sourceId: FOCUS_NODE_ID,
        targetId: 'dependencies:postgres-pay',
      },
    ]);
  });

  it('shows every neighbour when a side fits', () => {
    const layout = layoutDependencyMap(
      focusService,
      { dependents: neighbours(MAX_NEIGHBOURS_PER_SIDE), dependencies: [] },
      'ltr',
    );

    expect(layout.nodes.filter((node) => node.kind === 'neighbour')).toHaveLength(
      MAX_NEIGHBOURS_PER_SIDE,
    );
    expect(layout.nodes.some((node) => node.kind === 'group')).toBe(false);
  });

  it('groups the neighbours beyond the limit into one node, keeping one row per side', () => {
    const layout = layoutDependencyMap(
      focusService,
      { dependents: neighbours(12), dependencies: [] },
      'ltr',
    );

    const dependentNodes = layout.nodes.filter((node) => node.kind !== 'focus');
    expect(dependentNodes).toHaveLength(MAX_NEIGHBOURS_PER_SIDE);
    expect(dependentNodes.at(-1)).toMatchObject({
      kind: 'group',
      side: 'dependents',
      hiddenCount: 12 - (MAX_NEIGHBOURS_PER_SIDE - 1),
    });
  });

  it('centres each column on the focused service', () => {
    const layout = layoutDependencyMap(
      focusService,
      { dependents: neighbours(3), dependencies: [] },
      'ltr',
    );

    const rows = layout.nodes
      .filter((node) => node.kind === 'neighbour')
      .map((node) => node.position.y);
    expect(rows[0]).toBe(-(rows[2] ?? 0));
    expect(rows[1]).toBe(0);
  });
});

describe('neighboursByAttention', () => {
  it('lists failing neighbours first so grouping never hides them', () => {
    const sorted = neighboursByAttention([
      neighbour('alpha'),
      neighbour('bravo', 'degraded'),
      neighbour('charlie', 'outage'),
      neighbour('delta', 'at-risk'),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['charlie', 'delta', 'bravo', 'alpha']);
  });
});
