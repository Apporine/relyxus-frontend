import { Check, Minus } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import type { ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/cn';

export type CheckboxProps = ComponentPropsWithRef<typeof CheckboxPrimitive.Root>;

/** Checked, unchecked or mixed. Checkbox changes take effect only when the form is saved. */
export function Checkbox({ className, ...checkboxProps }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer flex size-[1.125rem] shrink-0 items-center justify-center rounded-control border border-strong bg-surface-2',
        'transition-colors duration-(--rx-duration-feedback) ease-standard',
        'data-[state=checked]:border-action data-[state=checked]:bg-action data-[state=checked]:text-action-fg',
        'data-[state=indeterminate]:border-action data-[state=indeterminate]:bg-action data-[state=indeterminate]:text-action-fg',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...checkboxProps}
    >
      <CheckboxPrimitive.Indicator className="group flex items-center justify-center">
        <Check aria-hidden className="size-3.5 group-data-[state=indeterminate]:hidden" />
        <Minus aria-hidden className="hidden size-3.5 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
