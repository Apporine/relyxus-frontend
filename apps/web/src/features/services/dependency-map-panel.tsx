'use client';

import '@xyflow/react/dist/base.css';
import './dependency-map.css';

import { Banner, cn, IconButton, Skeleton } from '@relyxus/ui';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { textDirectionFor } from '@/lib/i18n/locales';
import { Panel } from '@/lib/ui/panel';
import { QuerySection } from '@/lib/ui/query-section';

import { layoutDependencyMap, type DependencyMapNode } from './dependency-map-layout';
import type { ServiceDependencies, ServiceSummary } from './model';
import { serviceHealthBorderClassNames, ServiceHealthLabel } from './service-labels';
import { servicesHref, type ServiceDetailTab } from './service-params';

const MAP_NODE_WIDTH_CLASS_NAME = 'w-44';

type MapNodeData = {
  mapNode: DependencyMapNode;
  /** Where a neighbour's link moves the focus; null for the focused service and groups. */
  href: Route | null;
  onShowAllDependencies: () => void;
};
type MapFlowNode = Node<MapNodeData, 'dependency'>;

function useTextDirection() {
  return textDirectionFor(useLocale());
}

/**
 * Hidden anchor points: the map is read-only, so nothing can be connected by hand. Edges run
 * from the inline-start side (what depends) to the inline-end side (what it depends on).
 */
function MapNodeHandles() {
  const direction = useTextDirection();
  const inlineStart = direction === 'rtl' ? Position.Right : Position.Left;
  const inlineEnd = direction === 'rtl' ? Position.Left : Position.Right;
  return (
    <>
      <Handle type="target" position={inlineStart} isConnectable={false} className="opacity-0" />
      <Handle type="source" position={inlineEnd} isConnectable={false} className="opacity-0" />
    </>
  );
}

function DependencyMapNodeView({ data }: NodeProps<MapFlowNode>) {
  const translateMap = useTranslations('services.map');
  const translateKinds = useTranslations('services.dependencyKinds');
  const direction = useTextDirection();
  const { mapNode, href, onShowAllDependencies } = data;
  // React Flow turns pointer events off on nodes that are neither selectable nor draggable;
  // the node's own link or button opts back in so it can be clicked.
  const baseClassNames = cn(
    'nodrag nopan pointer-events-auto flex flex-col gap-1 rounded-panel border bg-raised px-3 py-2 text-start',
    MAP_NODE_WIDTH_CLASS_NAME,
  );

  if (mapNode.kind === 'group') {
    return (
      <div dir={direction}>
        <MapNodeHandles />
        <button
          type="button"
          onClick={onShowAllDependencies}
          className={cn(
            baseClassNames,
            'border-dashed border-strong text-table font-semibold hover:bg-surface-2',
          )}
        >
          {translateMap(mapNode.side === 'dependents' ? 'moreDependents' : 'moreDependencies', {
            count: mapNode.hiddenCount,
          })}
        </button>
      </div>
    );
  }

  if (mapNode.kind === 'focus') {
    return (
      <div dir={direction}>
        <MapNodeHandles />
        <div
          aria-current="true"
          className={cn(
            baseClassNames,
            'border-2 bg-selected',
            serviceHealthBorderClassNames[mapNode.health],
          )}
        >
          <span className="truncate text-table font-semibold text-fg-primary">{mapNode.name}</span>
          <ServiceHealthLabel health={mapNode.health} />
        </div>
      </div>
    );
  }

  const { neighbour } = mapNode;
  const content = (
    <>
      <span className="truncate text-table font-semibold text-fg-primary">{neighbour.name}</span>
      <span className="flex items-center justify-between gap-2">
        <ServiceHealthLabel health={neighbour.health} />
        {neighbour.kind === 'service' ? null : (
          <span className="text-meta text-fg-tertiary">{translateKinds(neighbour.kind)}</span>
        )}
      </span>
    </>
  );

  return (
    <div dir={direction}>
      <MapNodeHandles />
      {href === null ? (
        <div className={cn(baseClassNames, serviceHealthBorderClassNames[neighbour.health])}>
          {content}
        </div>
      ) : (
        <Link
          href={href}
          replace
          scroll={false}
          className={cn(
            baseClassNames,
            'hover:bg-surface-2',
            serviceHealthBorderClassNames[neighbour.health],
          )}
        >
          {content}
        </Link>
      )}
    </div>
  );
}

const mapNodeTypes = { dependency: DependencyMapNodeView };

/** Sits above the canvas rather than on it, so it can never cover a node. */
function MapZoomControls() {
  const translateMap = useTranslations('services.map');
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  return (
    <div className="flex gap-1 rounded-control border border-control bg-surface-1 p-1">
      <IconButton
        size="small"
        label={translateMap('zoomIn')}
        icon={<ZoomIn />}
        onClick={() => void zoomIn()}
      />
      <IconButton
        size="small"
        label={translateMap('zoomOut')}
        icon={<ZoomOut />}
        onClick={() => void zoomOut()}
      />
      <IconButton
        size="small"
        label={translateMap('fitView')}
        icon={<Maximize />}
        onClick={() => void fitView()}
      />
    </div>
  );
}

type DependencyMapCanvasProps = {
  workspaceSlug: string;
  service: ServiceSummary;
  dependencies: ServiceDependencies;
  selectedTab: ServiceDetailTab;
  searchText: string;
  onShowAllDependencies: () => void;
};

function DependencyMapCanvas({
  workspaceSlug,
  service,
  dependencies,
  selectedTab,
  searchText,
  onShowAllDependencies,
}: DependencyMapCanvasProps) {
  const translateMap = useTranslations('services.map');
  const direction = useTextDirection();

  const { nodes, edges } = useMemo(() => {
    const layout = layoutDependencyMap(service, dependencies, direction);
    const flowNodes: MapFlowNode[] = layout.nodes.map((mapNode) => ({
      id: mapNode.id,
      type: 'dependency',
      position: mapNode.position,
      data: {
        mapNode,
        href:
          mapNode.kind === 'neighbour' && mapNode.neighbour.kind === 'service'
            ? servicesHref(workspaceSlug, {
                serviceId: mapNode.neighbour.id,
                tab: selectedTab,
                searchText,
              })
            : null,
        onShowAllDependencies,
      },
    }));
    const flowEdges: Edge[] = layout.edges.map((mapEdge) => ({
      id: mapEdge.id,
      source: mapEdge.sourceId,
      target: mapEdge.targetId,
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-strong)' },
    }));
    return { nodes: flowNodes, edges: flowEdges };
  }, [
    dependencies,
    direction,
    onShowAllDependencies,
    searchText,
    selectedTab,
    service,
    workspaceSlug,
  ]);

  return (
    <ReactFlowProvider>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-meta text-fg-secondary">
          {translateMap('neighbourCounts', {
            dependencies: dependencies.dependencies.length,
            dependents: dependencies.dependents.length,
          })}
        </p>
        <MapZoomControls />
      </div>
      <div
        role="group"
        aria-label={translateMap('canvasLabel', { service: service.name })}
        className="relyxus-dependency-map h-[28rem] rounded-panel border border-divider bg-canvas"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={mapNodeTypes}
          fitView
          minZoom={0.4}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          zoomOnDoubleClick={false}
          ariaLabelConfig={{
            'node.a11yDescription.default': translateMap('nodeDescription'),
            'node.a11yDescription.keyboardDisabled': translateMap('nodeDescription'),
            'edge.a11yDescription.default': translateMap('edgeDescription'),
          }}
        />
      </div>
    </ReactFlowProvider>
  );
}

type DependencyMapPanelProps = Omit<DependencyMapCanvasProps, 'dependencies'> & {
  query: UseQueryResult<ServiceDependencies>;
};

/**
 * The dependency map in focus mode (UI/UX s. 13.2). The Dependencies tab lists the same
 * neighbours as text, so nothing on the map is available only visually.
 */
export function DependencyMapPanel({ query, ...canvasProps }: DependencyMapPanelProps) {
  const translateMap = useTranslations('services.map');
  const { service } = canvasProps;

  return (
    <Panel title={translateMap('title')}>
      <p className="-mt-2 text-meta text-fg-secondary">
        {translateMap('focusDescription', { service: service.name })}
      </p>
      <QuerySection
        query={query}
        sectionName={translateMap('title')}
        loadingPlaceholder={<Skeleton className="h-[28rem] w-full" />}
      >
        {(dependencies) => {
          const vendorsInOutage = dependencies.dependencies.filter(
            (neighbour) => neighbour.kind !== 'service' && neighbour.health === 'outage',
          );
          const hasNeighbours =
            dependencies.dependents.length > 0 || dependencies.dependencies.length > 0;
          return (
            <>
              {vendorsInOutage.map((vendor) => (
                <Banner
                  key={vendor.id}
                  tone="warning"
                  title={translateMap('vendorOutageTitle', { vendor: vendor.name })}
                  description={translateMap('vendorOutageDescription', {
                    service: service.name,
                    vendor: vendor.name,
                  })}
                />
              ))}
              {hasNeighbours ? (
                // Keyed by service so the viewport fits again whenever the focus moves.
                <DependencyMapCanvas
                  key={service.id}
                  {...canvasProps}
                  dependencies={dependencies}
                />
              ) : (
                <p className="text-body text-fg-secondary">
                  {translateMap('noDependencies', { service: service.name })}
                </p>
              )}
            </>
          );
        }}
      </QuerySection>
    </Panel>
  );
}
