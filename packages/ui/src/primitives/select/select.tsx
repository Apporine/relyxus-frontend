import { Check, ChevronDown } from 'lucide-react';
import { Select as SelectPrimitive } from 'radix-ui';
import type { ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/cn';
import { textControlClassNames } from '../input/input';

/*
 * Single-choice select for short option lists. Lists longer than ten options need the
 * searchable combobox instead (UI/UX s. 7); Radix still provides keyboard type-ahead here.
 */

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

export function SelectTrigger({
  className,
  children,
  ...triggerProps
}: ComponentPropsWithRef<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        textControlClassNames,
        'flex h-(--rx-control-height) items-center justify-between gap-2 text-start',
        'data-placeholder:text-fg-tertiary',
        className,
      )}
      {...triggerProps}
    >
      <span className="truncate">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown aria-hidden className="size-4 shrink-0 text-fg-secondary" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...contentProps
}: ComponentPropsWithRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        sideOffset={4}
        className={cn(
          'z-(--rx-layer-dialog) max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width)',
          'overflow-hidden rounded-panel border border-control bg-raised text-fg-primary',
          className,
        )}
        {...contentProps}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...itemProps
}: ComponentPropsWithRef<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex min-h-8 cursor-default items-center rounded-control py-1.5 ps-8 pe-3 text-body outline-none select-none',
        'data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-selected',
        className,
      )}
      {...itemProps}
    >
      <span className="absolute start-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check aria-hidden className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectLabel({
  className,
  ...labelProps
}: ComponentPropsWithRef<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn('px-3 py-1.5 text-meta font-semibold text-fg-tertiary', className)}
      {...labelProps}
    />
  );
}

export function SelectSeparator({
  className,
  ...separatorProps
}: ComponentPropsWithRef<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn('my-1 h-px bg-divider', className)}
      {...separatorProps}
    />
  );
}
