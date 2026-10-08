import { cva } from 'class-variance-authority';
import { Info, OctagonAlert, TriangleAlert, X } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

/*
 * Persistent banners carry degraded, security-relevant and licence states (UI/UX s. 4 and 8).
 * Danger banners are locked: the type system does not accept a dismiss handler for them.
 */

export type BannerTone = 'info' | 'warning' | 'danger';

const bannerVariants = cva('flex items-start gap-3 border px-4 py-3 text-fg-primary', {
  variants: {
    tone: {
      info: 'border-control bg-surface-2',
      warning: 'border-warning bg-warning-subtle',
      danger: 'border-critical bg-critical-subtle',
    },
    placement: {
      global: 'border-x-0 border-t-0',
      page: 'rounded-panel',
    },
  },
});

const toneIcons = {
  info: <Info aria-hidden className="size-5 shrink-0 text-neutral" />,
  warning: <TriangleAlert aria-hidden className="size-5 shrink-0 text-warning" />,
  danger: <OctagonAlert aria-hidden className="size-5 shrink-0 text-critical" />,
} satisfies Record<BannerTone, ReactNode>;

type DismissProps =
  | {
      tone: 'danger';
      onDismiss?: never;
      dismissLabel?: never;
    }
  | {
      tone: 'info' | 'warning';
      /** Omit to lock the banner in place. */
      onDismiss?: () => void;
      dismissLabel?: string;
    };

export type BannerProps = DismissProps & {
  title: string;
  description?: ReactNode;
  /** One follow-up action, for example "View platform status". */
  action?: ReactNode;
  placement?: 'global' | 'page';
  className?: string;
};

export function Banner({
  tone,
  title,
  description,
  action,
  onDismiss,
  dismissLabel,
  placement = 'page',
  className,
}: BannerProps) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(bannerVariants({ tone, placement }), className)}
    >
      {toneIcons[tone]}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-body font-semibold">{title}</p>
        {description === undefined ? null : (
          <div className="text-meta text-fg-secondary">{description}</div>
        )}
      </div>
      {action === undefined ? null : <div className="shrink-0">{action}</div>}
      {onDismiss === undefined ? null : (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="flex size-6 shrink-0 items-center justify-center rounded-control text-fg-secondary hover:bg-surface-2 hover:text-fg-primary"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}
