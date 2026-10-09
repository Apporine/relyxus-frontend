'use client';

import { Button } from '@relyxus/ui';
import { useId } from 'react';

/**
 * A page's primary action that cannot be used yet, with the reason visible beside it rather
 * than hidden in a tooltip that a disabled button cannot show (UI/UX s. 7).
 */
export function UnavailableAction({ label, reason }: { label: string; reason: string }) {
  const reasonId = useId();
  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="primary" disabled aria-describedby={reasonId}>
        {label}
      </Button>
      <p id={reasonId} className="max-w-72 text-end text-meta text-fg-tertiary">
        {reason}
      </p>
    </div>
  );
}
