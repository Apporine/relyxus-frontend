import { X } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cn } from '../../lib/cn';
import { IconButton } from '../button/icon-button';

/*
 * Dialogs are only for focused decisions (UI/UX s. 8). Radix traps focus while open, closes
 * on Escape and returns focus to the trigger on close.
 */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const dialogOverlayClassNames = 'fixed inset-0 z-(--rx-layer-dialog) bg-canvas/80';

export type DialogContentProps = ComponentPropsWithRef<typeof DialogPrimitive.Content> & {
  /** Accessible name of the close button, for example "Close dialog". */
  closeLabel: string;
  size?: 'medium' | 'large';
};

export function DialogContent({
  className,
  children,
  closeLabel,
  size = 'medium',
  ...contentProps
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={dialogOverlayClassNames} />
      <DialogPrimitive.Content
        className={cn(
          'fixed inset-x-4 top-1/2 z-(--rx-layer-dialog) mx-auto flex max-h-[calc(100dvh-2rem)] -translate-y-1/2 flex-col',
          'rounded-dialog border border-control bg-raised text-fg-primary',
          size === 'medium' ? 'max-w-lg' : 'max-w-3xl',
          className,
        )}
        {...contentProps}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <IconButton
            label={closeLabel}
            icon={<X />}
            size="small"
            className="absolute end-3 top-3"
          />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('flex flex-col gap-1 px-6 pe-14 pt-6', className)}>{children}</div>;
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('overflow-y-auto px-6 py-4', className)}>{children}</div>;
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-3 border-t border-divider px-6 py-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogTitle({
  className,
  ...titleProps
}: ComponentPropsWithRef<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-section-title font-semibold text-fg-primary', className)}
      {...titleProps}
    />
  );
}

export function DialogDescription({
  className,
  ...descriptionProps
}: ComponentPropsWithRef<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-body text-fg-secondary', className)}
      {...descriptionProps}
    />
  );
}
