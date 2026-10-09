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
  'incident-types',
  'status-pages',
  'users',
  'security',
  'support-access',
  'platform',
  'promotion',
] as const;
export type AdminPage = (typeof adminPages)[number];

export function adminPageHref(workspaceSlug: string, page: AdminPage): Route {
  return `${areaHref(workspaceSlug, 'admin')}/${page}` as Route;
}

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
