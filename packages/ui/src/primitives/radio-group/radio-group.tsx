import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type { ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/cn';

export function RadioGroup({
  className,
  ...groupProps
}: ComponentPropsWithRef<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...groupProps} />;
}

export function RadioGroupItem({
  className,
  ...itemProps
}: ComponentPropsWithRef<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'flex size-[1.125rem] shrink-0 items-center justify-center rounded-full border border-strong bg-surface-2',
        'data-[state=checked]:border-action',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...itemProps}
    >
      <RadioGroupPrimitive.Indicator className="block size-2 rounded-full bg-action" />
    </RadioGroupPrimitive.Item>
  );
}
