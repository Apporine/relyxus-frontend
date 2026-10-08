import type { ReactNode } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '../../primitives/popover/popover';
import { statusPillVariants } from '../badges/status-pill';
import { cn } from '../../lib/cn';

/*
 * Marks AI-written content (UI/UX principle 13). Obsidian keeps AI authorship monochrome:
 * the marker is distinguished by its words, never by a hue, sparkle or avatar.
 *
 * With details, the marker is a button that opens model, generation time and "Why am I
 * seeing this?" in a popover, so the information is reachable by keyboard and touch rather
 * than only on hover.
 */

export type AiMarkerProps = {
  /** Localised marker text, for example "AI generated". */
  label: string;
  /** Provenance such as model route, generation time and linked evidence count. */
  details?: ReactNode;
  className?: string;
};

const markerClassNames = cn(
  statusPillVariants({ tone: 'neutral', appearance: 'outline' }),
  'border-ai text-ai',
);

export function AiMarker({ label, details, className }: AiMarkerProps) {
  if (details === undefined) {
    return <span className={cn(markerClassNames, className)}>{label}</span>;
  }

  return (
    <Popover>
      <PopoverTrigger className={cn(markerClassNames, 'hover:bg-surface-2', className)}>
        {label}
      </PopoverTrigger>
      <PopoverContent className="text-meta text-fg-secondary">{details}</PopoverContent>
    </Popover>
  );
}
