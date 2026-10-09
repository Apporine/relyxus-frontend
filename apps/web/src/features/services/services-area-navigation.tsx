'use client';

import { cn } from '@relyxus/ui';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { areaHref } from '@/shell/navigation/navigation-model';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import { businessServicesHref } from './business-service-params';

/** Moves between the technical catalogue and the business view of the Services area. */
export function ServicesAreaNavigation({ current }: { current: 'technical' | 'business' }) {
  const translateNavigation = useTranslations('services.areaNavigation');
  const { workspace } = useCurrentWorkspace();
  const links = [
    { view: 'technical', href: areaHref(workspace.slug, 'services') },
    { view: 'business', href: businessServicesHref(workspace.slug) },
  ] as const;

  return (
    <nav aria-label={translateNavigation('label')} className="-mt-2 border-b border-divider">
      <ul className="flex gap-4">
        {links.map((link) => (
          <li key={link.view}>
            <Link
              href={link.href}
              aria-current={link.view === current ? 'page' : undefined}
              className={cn(
                '-mb-px inline-flex h-10 items-center border-b-2 text-table font-semibold',
                link.view === current
                  ? 'border-fg-primary text-fg-primary'
                  : 'border-transparent text-fg-secondary hover:text-fg-primary',
              )}
            >
              {translateNavigation(link.view)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
