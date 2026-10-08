import type { ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/cn';

/*
 * Input boundaries use the Strong border: Obsidian's Control border falls below the 3:1
 * contrast WCAG 2.2 requires for a control boundary (open question Q15).
 */
export const textControlClassNames = cn(
  'w-full rounded-control border border-strong bg-surface-2 px-3 text-body text-fg-primary',
  'placeholder:text-fg-tertiary',
  'transition-colors duration-(--rx-duration-hover) ease-standard',
  'hover:border-fg-tertiary',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'read-only:bg-surface-1',
  'aria-invalid:border-critical',
);

export type InputProps = ComponentPropsWithRef<'input'>;

export function Input({ className, type, ...inputProps }: InputProps) {
  return (
    <input
      type={type ?? 'text'}
      className={cn(textControlClassNames, 'h-(--rx-control-height)', className)}
      {...inputProps}
    />
  );
}

export type TextareaProps = ComponentPropsWithRef<'textarea'>;

export function Textarea({ className, rows, ...textareaProps }: TextareaProps) {
  return (
    <textarea
      rows={rows ?? 4}
      className={cn(textControlClassNames, 'min-h-20 py-2', className)}
      {...textareaProps}
    />
  );
}
