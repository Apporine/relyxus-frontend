import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { Slot } from 'radix-ui';
import type { ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/cn';

export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap',
    '[&_svg]:size-4 [&_svg]:shrink-0',
    'rounded-button border font-semibold select-none',
    'transition-colors duration-(--rx-duration-hover) ease-standard',
    'disabled:cursor-not-allowed',
    'aria-busy:cursor-progress',
  ],
  {
    variants: {
      variant: {
        primary:
          'border-action bg-action text-action-fg hover:border-fg-secondary hover:bg-fg-secondary disabled:border-control disabled:bg-surface-2 disabled:text-fg-tertiary disabled:hover:border-control disabled:hover:bg-surface-2',
        secondary:
          'border-control bg-surface-2 text-fg-primary hover:bg-raised active:bg-selected disabled:opacity-50',
        tertiary:
          'border-control bg-transparent text-fg-primary hover:bg-surface-2 active:bg-raised disabled:opacity-50',
        danger:
          'border-critical bg-transparent text-critical hover:bg-critical-subtle active:bg-critical-subtle disabled:border-control disabled:bg-transparent disabled:text-fg-tertiary disabled:hover:bg-transparent',
        ghost:
          'border-transparent bg-transparent text-fg-secondary hover:bg-surface-2 hover:text-fg-primary active:bg-raised disabled:opacity-50',
      },
      size: {
        small: 'h-8 px-3 text-table',
        medium: 'h-(--rx-control-height) px-4 text-body',
        large: 'h-(--rx-touch-target) px-5 text-body',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'medium',
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps = ComponentPropsWithRef<'button'> &
  ButtonVariantProps & {
    /**
     * Shows a spinner beside the label while an operation runs. The label stays visible so
     * the person always knows which action is in progress.
     */
    isLoading?: boolean;
    /** Renders the single child element (for example a link) with button styling instead. */
    asChild?: boolean;
  };

/**
 * One primary button per region. Destructive buttons name the action ("Delete connector"),
 * and production actions name the target ("Restart payments-api in PROD").
 */
export function Button({
  className,
  variant,
  size,
  isLoading = false,
  asChild = false,
  disabled,
  type,
  children,
  ...buttonProps
}: ButtonProps) {
  const classNames = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot.Root className={classNames} {...buttonProps}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      type={type ?? 'button'}
      className={classNames}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...buttonProps}
    >
      {isLoading ? <LoaderCircle aria-hidden className="animate-spin" /> : null}
      {children}
    </button>
  );
}
