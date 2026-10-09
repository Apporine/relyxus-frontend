import type { TextDirection } from '@relyxus/ui';

import type { DependencyNeighbour, ServiceDependencies, ServiceHealth } from './model';

/*
 * Focus-mode layout for the dependency map (UI/UX s. 13.2). The focused service sits in the
 * centre, the services that depend on it on the inline-start side and what it depends on at
 * the inline-end side. Each side shows at most MAX_NEIGHBOURS_PER_SIDE neighbours; the rest
 * are grouped into one node, so a 1,000+ service graph stays readable.
 */

export const MAX_NEIGHBOURS_PER_SIDE = 6;
export const FOCUS_NODE_ID = 'focus';
const COLUMN_GAP = 300;
const ROW_GAP = 84;

export const dependencyMapSides = ['dependents', 'dependencies'] as const;
export type DependencyMapSide = (typeof dependencyMapSides)[number];

export type MapPosition = { x: number; y: number };

export type DependencyMapNode =
  | {
      kind: 'focus';
      id: typeof FOCUS_NODE_ID;
      serviceId: string;
      name: string;
      health: ServiceHealth;
      position: MapPosition;
    }
  | {
      kind: 'neighbour';
      id: string;
      side: DependencyMapSide;
      neighbour: DependencyNeighbour;
      position: MapPosition;
    }
  | {
      kind: 'group';
      id: string;
      side: DependencyMapSide;
      hiddenCount: number;
      position: MapPosition;
    };

/** An edge always points from the service that depends to the one it depends on. */
export type DependencyMapEdge = { id: string; sourceId: string; targetId: string };

export type DependencyMapLayout = {
  nodes: DependencyMapNode[];
  edges: DependencyMapEdge[];
};

/** Problems first, so grouping never hides a failing neighbour behind "+N more". */
const healthAttentionOrder = {
  outage: 0,
  'at-risk': 1,
  degraded: 2,
  unknown: 3,
  healthy: 4,
} satisfies Record<ServiceHealth, number>;

export function neighboursByAttention(
  neighbours: readonly DependencyNeighbour[],
): DependencyNeighbour[] {
  return neighbours.toSorted(
    (first, second) =>
      healthAttentionOrder[first.health] - healthAttentionOrder[second.health] ||
      first.name.localeCompare(second.name),
  );
}

function rowPosition(rowIndex: number, rowCount: number): number {
  return (rowIndex - (rowCount - 1) / 2) * ROW_GAP;
}

function groupNodeId(side: DependencyMapSide): string {
  return `group:${side}`;
}

function neighbourNodeId(side: DependencyMapSide, neighbourId: string): string {
  return `${side}:${neighbourId}`;
}

type FocusService = { id: string; name: string; health: ServiceHealth };

export function layoutDependencyMap(
  focusService: FocusService,
  dependencies: Pick<ServiceDependencies, 'dependents' | 'dependencies'>,
  direction: TextDirection,
): DependencyMapLayout {
  const inlineStartSign = direction === 'rtl' ? 1 : -1;
  const nodes: DependencyMapNode[] = [
    {
      kind: 'focus',
      id: FOCUS_NODE_ID,
      serviceId: focusService.id,
      name: focusService.name,
      health: focusService.health,
      position: { x: 0, y: 0 },
    },
  ];
  const edges: DependencyMapEdge[] = [];

  for (const side of dependencyMapSides) {
    const sortedNeighbours = neighboursByAttention(dependencies[side]);
    const hasGroup = sortedNeighbours.length > MAX_NEIGHBOURS_PER_SIDE;
    const visibleNeighbours = hasGroup
      ? sortedNeighbours.slice(0, MAX_NEIGHBOURS_PER_SIDE - 1)
      : sortedNeighbours;
    const rowCount = visibleNeighbours.length + (hasGroup ? 1 : 0);
    const columnX = (side === 'dependents' ? inlineStartSign : -inlineStartSign) * COLUMN_GAP;
    const sideNodeIds: string[] = [];

    visibleNeighbours.forEach((neighbour, rowIndex) => {
      const id = neighbourNodeId(side, neighbour.id);
      sideNodeIds.push(id);
      nodes.push({
        kind: 'neighbour',
        id,
        side,
        neighbour,
        position: { x: columnX, y: rowPosition(rowIndex, rowCount) },
      });
    });

    if (hasGroup) {
      const id = groupNodeId(side);
      sideNodeIds.push(id);
      nodes.push({
        kind: 'group',
        id,
        side,
        hiddenCount: sortedNeighbours.length - visibleNeighbours.length,
        position: { x: columnX, y: rowPosition(rowCount - 1, rowCount) },
      });
    }

    for (const nodeId of sideNodeIds) {
      edges.push(
        side === 'dependents'
          ? { id: `${nodeId}->${FOCUS_NODE_ID}`, sourceId: nodeId, targetId: FOCUS_NODE_ID }
          : { id: `${FOCUS_NODE_ID}->${nodeId}`, sourceId: FOCUS_NODE_ID, targetId: nodeId },
      );
    }
  }

  return { nodes, edges };
}
