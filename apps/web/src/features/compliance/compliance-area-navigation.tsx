'use client';

import type { Route } from 'next';
import { useTranslations } from 'next-intl';

import { AreaSubNavigation } from '@/lib/ui/area-sub-navigation';
import { areaHref } from '@/shell/navigation/navigation-model';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

const compliancePages = ['overview', 'rules'] as const;
export type CompliancePage = (typeof compliancePages)[number];

export function compliancePageHref(workspaceSlug: string, page: CompliancePage): Route {
  const base = areaHref(workspaceSlug, 'compliance');
  return (page === 'overview' ? base : `${base}/${page}`) as Route;
}

/** A regulator report opens inside the Compliance area. */
export function regulatorReportHref(workspaceSlug: string, reportId: string): Route {
  return `${areaHref(workspaceSlug, 'compliance')}/reports/${encodeURIComponent(reportId)}` as Route;
}

export function ComplianceAreaNavigation({ current }: { current: CompliancePage }) {
  const translateNavigation = useTranslations('compliance.areaNavigation');
  const { workspace } = useCurrentWorkspace();
  return (
    <AreaSubNavigation
      label={translateNavigation('label')}
      currentKey={current}
      links={compliancePages.map((page) => ({
        key: page,
        label: translateNavigation(page),
        href: compliancePageHref(workspace.slug, page),
      }))}
    />
  );
}
