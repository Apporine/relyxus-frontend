'use client';

import { cn } from '@relyxus/ui';
import { useId, type ReactNode } from 'react';

type PanelProps = {
  title: string;
  /** A link or button beside the title, for example "View all incidents". */
  action?: ReactNode;
  headingLevel?: 2 | 3;
  /** Visually quieter heading for panels grouped under a shared section heading. */
  titleStyle?: 'panel' | 'label';
  className?: string;
  children: ReactNode;
};

/** A titled region of a screen; its heading names the landmark for assistive technology. */
export function Panel({
  title,
  action,
  headingLevel = 2,
  titleStyle = 'panel',
  className,
  children,
}: PanelProps) {
  const headingId = useId();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col gap-4 rounded-panel border border-control bg-surface-1 p-5',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <Heading
          id={headingId}
          className={
            titleStyle === 'panel'
              ? 'text-panel-title font-semibold text-fg-primary'
              : 'text-meta font-semibold text-fg-secondary uppercase'
          }
        >
          {title}
        </Heading>
        {action}
      </header>
      {children}
    </section>
  );
}
