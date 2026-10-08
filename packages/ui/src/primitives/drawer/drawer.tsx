'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { IconButton } from '../button/icon-button';

/*
 * The context drawer opens at the inline end (right in English, left in Arabic) to inspect
 * or compare without leaving the page. Its open state and content belong in the URL so it
 * can be shared (UI/UX s. 4); screens control `open` from their search parameters.
 */

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

const drawerWidths = cva('', {
  variants: {
    width: {
      narrow: 'w-[400px]',
      standard: 'w-[480px]',
      wide: 'w-[560px]',
    },
  },
  defaultVariants: {
    width: 'standard',
  },
});

export type DrawerContentProps = ComponentPropsWithRef<typeof DialogPrimitive.Content> &
  VariantProps<typeof drawerWidths> & {
    /** Accessible name of the close button, for example "Close drawer". */
    closeLabel: string;
    title: ReactNode;
    description?: ReactNode;
  };

export function DrawerContent({
  className,
  children,
  closeLabel,
  title,
  description,
  width,
  onOpenAutoFocus,
  ...contentProps
}: DrawerContentProps) {
  // Focus the drawer itself rather than its first control. Focusing the close button would
  // open its tooltip, and the first Escape would then dismiss the tooltip instead of the drawer.
  function focusDrawerOnOpen(event: Event) {
    onOpenAutoFocus?.(event);
    if (event.defaultPrevented) {
      return;
    }
    event.preventDefault();
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.focus();
    }
  }

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-(--rx-layer-drawer) bg-canvas/60" />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-y-0 end-0 z-(--rx-layer-drawer) flex max-w-full flex-col',
          'rounded-s-dialog border-s border-control bg-surface-1 text-fg-primary',
          drawerWidths({ width }),
          className,
        )}
        {...(description === undefined ? { 'aria-describedby': undefined } : {})}
        onOpenAutoFocus={focusDrawerOnOpen}
        {...contentProps}
      >
        <header className="flex items-start justify-between gap-4 border-b border-divider px-5 py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <DialogPrimitive.Title className="text-panel-title font-semibold">
              {title}
            </DialogPrimitive.Title>
            {description === undefined ? null : (
              <DialogPrimitive.Description className="text-meta text-fg-secondary">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close asChild>
            <IconButton label={closeLabel} icon={<X />} size="small" />
          </DialogPrimitive.Close>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
