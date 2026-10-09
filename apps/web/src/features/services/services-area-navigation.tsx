'use client';

import { useTranslations } from 'next-intl';

import { AreaSubNavigation } from '@/lib/ui/area-sub-navigation';
import { areaHref } from '@/shell/navigation/navigation-model';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { businessServicesHref } from './business-service-params';

/** Moves between the technical catalogue and the business view of the Services area. */
export function ServicesAreaNavigation({ current }: { current: 'technical' | 'business' }) {
  const translateNavigation = useTranslations('services.areaNavigation');
  const { workspace } = useCurrentWorkspace();
  return (
    <AreaSubNavigation
      label={translateNavigation('label')}
      currentKey={current}
      links={[
        {
          key: 'technical',
          label: translateNavigation('technical'),
          href: areaHref(workspace.slug, 'services'),
        },
        {
          key: 'business',
          label: translateNavigation('business'),
          href: businessServicesHref(workspace.slug),
        },
      ]}
    />
  );
}
