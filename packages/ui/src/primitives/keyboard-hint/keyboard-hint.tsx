import { Fragment, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

export type KeyboardHintProps = {
  /** Keys in the order they are pressed, for example ["Ctrl", "K"]. */
  keys: readonly string[];
  /** Placed between keys of a sequence, for example the localised word "then". */
  separator?: ReactNode;
  className?: string;
};

export function KeyboardHint({ keys, separator, className }: KeyboardHintProps) {
  return (
    <span dir="ltr" className={cn('inline-flex items-center gap-1', className)}>
      {keys.map((key, index) => (
        <Fragment key={`${key}-${index}`}>
          {index > 0 && separator !== undefined ? (
            <span className="text-meta text-fg-tertiary">{separator}</span>
          ) : null}
          <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-control border border-control bg-surface-2 px-1 font-mono text-meta text-fg-secondary">
            {key}
          </kbd>
        </Fragment>
      ))}
    </span>
  );
}
