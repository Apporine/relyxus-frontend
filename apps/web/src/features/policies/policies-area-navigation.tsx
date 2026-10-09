'use client';

import type { Route } from 'next';
import { useTranslations } from 'next-intl';

import { AreaSubNavigation } from '@/lib/ui/area-sub-navigation';
import { areaHref } from '@/shell/navigation/navigation-model';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

const policyPages = ['policies', 'approval-routing', 'notification-rules'] as const;
export type PolicyPage = (typeof policyPages)[number];

export function policyPageHref(workspaceSlug: string, page: PolicyPage): Route {
  const base = areaHref(workspaceSlug, 'policies');
  return (page === 'policies' ? base : `${base}/${page}`) as Route;
}

/** Policies, approval routing and notification rules share the Policies area (UI/UX s. 11). */
export function PoliciesAreaNavigation({ current }: { current: PolicyPage }) {
  const translateNavigation = useTranslations('policies.areaNavigation');
  const { workspace } = useCurrentWorkspace();
  return (
    <AreaSubNavigation
      label={translateNavigation('label')}
      currentKey={current}
      links={policyPages.map((page) => ({
        key: page,
        label: translateNavigation(page),
        href: policyPageHref(workspace.slug, page),
      }))}
    />
  );
}
