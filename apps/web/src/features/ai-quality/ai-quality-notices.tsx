'use client';

import { Banner } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';

import type { ModelRoute, Scorecard } from './model';

/**
 * The model-governance states of UI/UX s. 11.7, most severe first: an unavailable route,
 * a fallback that would break residency, a regression, and a pinned version being retired.
 */
export function AiQualityNotices({
  scorecard,
  routes,
}: {
  scorecard: Scorecard | undefined;
  routes: readonly ModelRoute[] | undefined;
}) {
  const translateNotices = useTranslations('aiQuality.notices');
  const translateMetrics = useTranslations('aiQuality.notices.metrics');
  const format = useRelyxusFormat();
  const unavailableRoutes = routes?.filter((route) => route.status === 'unavailable') ?? [];
  const residencyBreakingRoutes =
    routes?.filter((route) => !route.isResidencyCompatible && route.role === 'fallback') ?? [];
  const retiringPinnedRoutes =
    routes?.filter((route) => route.isPinned && route.retiresAt !== null) ?? [];
  const regression = scorecard?.regression ?? null;

  return (
    <>
      {unavailableRoutes.map((route) => (
        <Banner
          key={`unavailable-${route.id}`}
          tone="danger"
          title={translateNotices('unavailableTitle', { name: route.name })}
          description={translateNotices('unavailableDescription')}
        />
      ))}
      {residencyBreakingRoutes.map((route) => (
        <Banner
          key={`residency-${route.id}`}
          tone="danger"
          title={translateNotices('residencyTitle', { name: route.name })}
          description={translateNotices('residencyDescription', { residency: route.residency })}
        />
      ))}
      {regression === null ? null : (
        <Banner
          tone="warning"
          title={translateNotices('regressionTitle', {
            metric: translateMetrics(regression.metric),
            route: regression.routeName,
          })}
          description={translateNotices('regressionDescription', {
            drop: regression.dropPoints,
            tolerance: regression.tolerancePoints,
          })}
        />
      )}
      {retiringPinnedRoutes.map((route) =>
        route.retiresAt === null ? null : (
          <Banner
            key={`retiring-${route.id}`}
            tone="warning"
            title={translateNotices('retiringTitle', { version: route.modelVersion })}
            description={translateNotices('retiringDescription', {
              name: route.name,
              time: format.dateAndTime(new Date(route.retiresAt)),
            })}
          />
        ),
      )}
    </>
  );
}
