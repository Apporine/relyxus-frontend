'use client';

import { cn } from '@relyxus/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { Panel } from '@/lib/ui/panel';

import type { ModelRoute, ModelRouteStatus } from './model';
import { replayRunHref } from './routes';

const routeStatusClassNames = {
  approved: 'text-healthy',
  shadow: 'text-fg-secondary',
  'pending-approval': 'text-warning',
  deprecated: 'text-warning',
  unavailable: 'text-critical',
} satisfies Record<ModelRouteStatus, string>;

function RouteWarnings({ route }: { route: ModelRoute }) {
  const translateRoutes = useTranslations('aiQuality.routes');
  const format = useRelyxusFormat();
  return (
    <>
      {route.isResidencyCompatible ? null : (
        <span className="block text-meta font-semibold text-critical">
          {translateRoutes('breaksResidency')}
        </span>
      )}
      {route.retiresAt === null ? null : (
        <span className="block text-meta font-semibold text-warning">
          {translateRoutes('retires', { time: format.dateAndTime(new Date(route.retiresAt)) })}
        </span>
      )}
    </>
  );
}

/** Approved primary and fallback routes, with why each one was approved (UI/UX s. 11.7). */
export function ModelRoutesPanel({
  workspaceSlug,
  routes,
}: {
  workspaceSlug: string;
  routes: readonly ModelRoute[];
}) {
  const translateRoutes = useTranslations('aiQuality.routes');
  const format = useRelyxusFormat();
  const columns = ['route', 'region', 'residency', 'status', 'lastReplay', 'accuracy'] as const;

  return (
    <Panel title={translateRoutes('title')}>
      <p className="-mt-2 text-meta text-fg-secondary">{translateRoutes('description')}</p>
      {routes.length === 0 ? (
        <p className="text-body text-fg-secondary">{translateRoutes('empty')}</p>
      ) : (
        // Focusable so the table can be scrolled sideways from the keyboard on narrow screens.
        <div
          role="region"
          aria-label={translateRoutes('tableLabel')}
          tabIndex={0}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[48rem] text-table">
            <thead>
              <tr className="text-meta text-fg-tertiary uppercase">
                {columns.map((column) => (
                  <th key={column} scope="col" className="pb-2 text-start font-semibold">
                    {translateRoutes(`columns.${column}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-t border-divider align-top">
                  <th scope="row" className="py-3 pe-4 text-start font-normal">
                    <span className="block font-semibold">
                      {translateRoutes('routeName', {
                        role: translateRoutes(`roles.${route.role}`),
                        name: route.name,
                      })}
                    </span>
                    <span dir="ltr" className="block font-mono text-meta text-fg-secondary">
                      {route.modelVersion}
                    </span>
                    {route.isPinned ? (
                      <span className="block text-meta text-fg-secondary">
                        {translateRoutes('pinned')}
                      </span>
                    ) : null}
                    {route.approval === null ? null : (
                      <span className="block text-meta text-fg-secondary">
                        {translateRoutes('approvedBy', {
                          name: route.approval.approvedByName,
                          time: format.dateAndTime(new Date(route.approval.approvedAt)),
                        })}{' '}
                        <Link
                          href={replayRunHref(workspaceSlug, route.approval.replayRunId)}
                          className="font-semibold text-fg-primary underline underline-offset-2"
                        >
                          {translateRoutes('viewEvidence', { name: route.name })}
                        </Link>
                      </span>
                    )}
                  </th>
                  <td className="py-3 pe-4">{route.region}</td>
                  <td className="py-3 pe-4">
                    {route.residency}
                    <RouteWarnings route={route} />
                  </td>
                  <td
                    className={cn('py-3 pe-4 font-semibold', routeStatusClassNames[route.status])}
                  >
                    {translateRoutes(`statuses.${route.status}`)}
                  </td>
                  <td className="py-3 pe-4">
                    {route.lastReplayAt === null
                      ? translateRoutes('never')
                      : format.dateAndTime(new Date(route.lastReplayAt))}
                  </td>
                  <td className="py-3 tabular-nums">
                    {route.accuracyPercent === null
                      ? translateRoutes('noAccuracy')
                      : translateRoutes('percent', { value: route.accuracyPercent / 100 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
