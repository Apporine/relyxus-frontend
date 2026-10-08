import { Switch as SwitchPrimitive } from 'radix-ui';
import type { ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/cn';

export type SwitchProps = ComponentPropsWithRef<typeof SwitchPrimitive.Root>;

/** A switch acts immediately. Use a checkbox when the change waits for a save. */
export function Switch({ className, ...switchProps }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-strong bg-surface-2 p-0.5',
        'transition-colors duration-(--rx-duration-feedback) ease-standard',
        'data-[state=checked]:border-action data-[state=checked]:bg-action',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...switchProps}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block size-4 rounded-full bg-fg-secondary',
          'transition-transform duration-(--rx-duration-feedback) ease-standard',
          'data-[state=checked]:translate-x-4 data-[state=checked]:bg-action-fg',
          'rtl:data-[state=checked]:-translate-x-4',
        )}
      />
    </SwitchPrimitive.Root>
  );
}
