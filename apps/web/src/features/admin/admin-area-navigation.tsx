'use client';

import type { Route } from 'next';
import { useTranslations } from 'next-intl';

import { AreaSubNavigation } from '@/lib/ui/area-sub-navigation';
import { areaHref } from '@/shell/navigation/navigation-model';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

/*
 * Admin pages. Organisation-level pages are reached from the workspace Admin area until the
 * organisation shell route is decided (open question Q13).
 */
export const adminPages = [
  'overview',
  'incident-types',
  'status-pages',
  'users',
  'security',
  'support-access',
  'platform',
  'promotion',
  'trust-centre',
] as const;
export type AdminPage = (typeof adminPages)[number];

export function adminPageHref(workspaceSlug: string, page: AdminPage): Route {
  const base = areaHref(workspaceSlug, 'admin');
  return (page === 'overview' ? base : `${base}/${page}`) as Route;
}

/** Pages grouped by what they configure: this workspace, or the whole organisation. */
export const adminPageGroups = {
  workspace: ['incident-types', 'status-pages'],
  organisation: ['users', 'security', 'support-access', 'platform', 'promotion', 'trust-centre'],
} as const satisfies Record<string, readonly Exclude<AdminPage, 'overview'>[]>;

export function AdminAreaNavigation({ current }: { current: AdminPage }) {
  const translateNavigation = useTranslations('admin.navigation');
  const { workspace } = useCurrentWorkspace();
  return (
    <AreaSubNavigation
      label={translateNavigation('label')}
      currentKey={current}
      links={adminPages.map((page) => ({
        key: page,
        label: translateNavigation(page),
        href: adminPageHref(workspace.slug, page),
      }))}
    />
  );
}
