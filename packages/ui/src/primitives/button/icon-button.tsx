import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { Tooltip } from '../tooltip/tooltip';
import { buttonVariants } from './button';

const iconButtonSizes = cva('px-0', {
  variants: {
    size: {
      small: 'size-8',
      medium: 'size-(--rx-control-height)',
      large: 'size-(--rx-touch-target)',
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});

export type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-label'> &
  VariantProps<typeof iconButtonSizes> & {
    /** Accessible name and tooltip text; required because the button shows no visible label. */
    label: string;
    icon: ReactNode;
    variant?: 'secondary' | 'tertiary' | 'ghost';
  };

/**
 * A button whose only visible content is an icon. It always carries a tooltip and an
 * accessible name, and must never be the only way to trigger a critical action.
 */
export function IconButton({
  label,
  icon,
  variant = 'ghost',
  size,
  className,
  type,
  ...buttonProps
}: IconButtonProps) {
  return (
    <Tooltip content={label}>
      <button
        type={type ?? 'button'}
        aria-label={label}
        className={cn(buttonVariants({ variant }), iconButtonSizes({ size }), className)}
        {...buttonProps}
      >
        <span aria-hidden className="flex items-center justify-center">
          {icon}
        </span>
      </button>
    </Tooltip>
  );
}
