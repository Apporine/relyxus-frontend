import { Tooltip as TooltipPrimitive } from 'radix-ui';
import type { ReactElement, ReactNode } from 'react';

import { cn } from '../../lib/cn';

export const TooltipProvider = TooltipPrimitive.Provider;

export type TooltipProps = {
  /** Supplementary text only. Tooltips never hold information the person needs to act. */
  content: ReactNode;
  /** A single focusable element that triggers the tooltip on hover and keyboard focus. */
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
};

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            'z-(--rx-layer-dialog) max-w-80 rounded-control border border-control bg-raised px-2.5 py-1.5',
            'text-meta text-fg-primary',
            className,
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
