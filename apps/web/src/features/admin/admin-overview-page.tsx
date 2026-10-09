'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Panel } from '@/lib/ui/panel';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { AdminAreaNavigation, adminPageGroups, adminPageHref } from './admin-area-navigation';

/**
 * Admin landing page: what can be configured for this workspace and for the whole
 * organisation, each section with a one-line purpose.
 */
export function AdminOverviewPage() {
  const translateOverview = useTranslations('admin.overview');
  const translateNavigation = useTranslations('admin.navigation');
  const { workspace } = useCurrentWorkspace();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateOverview('title')}
        description={translateOverview('description', { workspace: workspace.name })}
      />
      <AdminAreaNavigation current="overview" />
      {(Object.keys(adminPageGroups) as (keyof typeof adminPageGroups)[]).map((group) => (
        <Panel key={group} title={translateOverview(`groups.${group}`)}>
          <p className="-mt-2 text-meta text-fg-secondary">
            {translateOverview(`groupDescriptions.${group}`)}
          </p>
          <ul className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
            {adminPageGroups[group].map((page) => (
              <li key={page}>
                <Link
                  href={adminPageHref(workspace.slug, page)}
                  className="flex h-full items-start justify-between gap-3 rounded-panel border border-divider p-4 transition-colors hover:bg-surface-2"
                >
                  <span className="flex flex-col gap-1">
                    <span className="text-body font-semibold text-fg-primary">
                      {translateNavigation(page)}
                    </span>
                    <span className="text-meta text-fg-secondary">
                      {translateOverview(`purposes.${page}`)}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden
                    className="mt-0.5 size-4 shrink-0 text-fg-tertiary rtl:rotate-180"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}
