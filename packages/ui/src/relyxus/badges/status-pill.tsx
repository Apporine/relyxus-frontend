import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

/*
 * Shared shape for operational badges. Meaning is always carried by an icon or word as well
 * as colour (UI/UX s. 6), so every pill renders text and most render a shape icon.
 */
export const statusPillVariants = cva(
  [
    'inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border px-2.5',
    'text-meta font-semibold whitespace-nowrap uppercase',
    '[&_svg]:size-3.5 [&_svg]:shrink-0',
  ],
  {
    variants: {
      tone: {
        critical: '',
        major: '',
        warning: '',
        healthy: '',
        neutral: '',
      },
      appearance: {
        filled: 'text-action-fg',
        outline: 'bg-transparent',
      },
    },
    compoundVariants: [
      { tone: 'critical', appearance: 'filled', className: 'border-critical bg-critical' },
      { tone: 'major', appearance: 'filled', className: 'border-major bg-major' },
      { tone: 'warning', appearance: 'filled', className: 'border-warning bg-warning' },
      { tone: 'healthy', appearance: 'filled', className: 'border-healthy bg-healthy' },
      { tone: 'neutral', appearance: 'filled', className: 'border-neutral bg-neutral' },
      { tone: 'critical', appearance: 'outline', className: 'border-critical text-critical' },
      { tone: 'major', appearance: 'outline', className: 'border-major text-major' },
      { tone: 'warning', appearance: 'outline', className: 'border-warning text-warning' },
      { tone: 'healthy', appearance: 'outline', className: 'border-healthy text-healthy' },
      { tone: 'neutral', appearance: 'outline', className: 'border-control text-fg-primary' },
    ],
    defaultVariants: {
      tone: 'neutral',
      appearance: 'outline',
    },
  },
);

export type StatusPillProps = VariantProps<typeof statusPillVariants> & {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function StatusPill({ tone, appearance, icon, children, className }: StatusPillProps) {
  return (
    <span className={cn(statusPillVariants({ tone, appearance }), className)}>
      {icon}
      {children}
    </span>
  );
}
