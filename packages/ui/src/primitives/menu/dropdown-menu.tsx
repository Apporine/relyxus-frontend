import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cn } from '../../lib/cn';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...contentProps
}: ComponentPropsWithRef<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(
          'z-(--rx-layer-dialog) min-w-48 rounded-panel border border-control bg-raised p-1 text-fg-primary',
          className,
        )}
        {...contentProps}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export type DropdownMenuItemProps = ComponentPropsWithRef<typeof DropdownMenuPrimitive.Item> & {
  /** Keyboard shortcut shown beside the item, for example a KeyboardHint. */
  shortcut?: ReactNode;
  tone?: 'default' | 'danger';
};

export function DropdownMenuItem({
  className,
  children,
  shortcut,
  tone = 'default',
  ...itemProps
}: DropdownMenuItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex min-h-8 cursor-default items-center gap-2 rounded-control px-3 py-1.5 text-body outline-none select-none',
        '[&_svg]:size-4 [&_svg]:shrink-0',
        'data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-selected',
        tone === 'danger' && 'text-critical',
        className,
      )}
      {...itemProps}
    >
      <span className="flex flex-1 items-center gap-2">{children}</span>
      {shortcut === undefined ? null : <span className="ms-6 text-fg-tertiary">{shortcut}</span>}
    </DropdownMenuPrimitive.Item>
  );
}

export function DropdownMenuLabel({
  className,
  ...labelProps
}: ComponentPropsWithRef<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn('px-3 py-1.5 text-meta font-semibold text-fg-tertiary', className)}
      {...labelProps}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...separatorProps
}: ComponentPropsWithRef<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn('my-1 h-px bg-divider', className)}
      {...separatorProps}
    />
  );
}
