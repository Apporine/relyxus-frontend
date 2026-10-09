import { cn } from '@relyxus/ui';
import type { Route } from 'next';
import Link from 'next/link';

export type AreaSubNavigationLink = { key: string; label: string; href: Route };

/** Pages within one sidebar area, for example Policies, Approval routing and Notification rules. */
export function AreaSubNavigation({
  label,
  links,
  currentKey,
}: {
  label: string;
  links: readonly AreaSubNavigationLink[];
  currentKey: string;
}) {
  return (
    <nav aria-label={label} className="-mt-2 overflow-x-auto border-b border-divider">
      <ul className="flex gap-4">
        {links.map((link) => {
          const isCurrent = link.key === currentKey;
          return (
            <li key={link.key}>
              <Link
                href={link.href}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  '-mb-px inline-flex h-10 items-center border-b-2 text-table font-semibold whitespace-nowrap',
                  isCurrent
                    ? 'border-fg-primary text-fg-primary'
                    : 'border-transparent text-fg-secondary hover:text-fg-primary',
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
