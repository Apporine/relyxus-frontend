import type { ReactNode } from 'react';

import { FullPageBusyState } from './full-page-busy-state';

type FullPageMessageProps = {
  title?: string;
  description?: ReactNode;
  /** The one next valid action, for example "Try again". */
  action?: ReactNode;
  icon?: ReactNode;
  isBusy?: boolean;
};

/** Whole-page loading, error and access states shown before or instead of the shell. */
export function FullPageMessage({
  title,
  description,
  action,
  icon,
  isBusy = false,
}: FullPageMessageProps) {
  if (isBusy) {
    return <FullPageBusyState label={title} />;
  }

  if (title === undefined) {
    throw new Error('FullPageMessage requires a title unless isBusy is set.');
  }

  return (
    <main id="main-content" className="flex min-h-dvh items-center justify-center bg-canvas p-6">
      <div className="flex w-full max-w-lg flex-col items-center gap-3 rounded-panel border border-control bg-surface-1 px-8 py-10 text-center">
        {icon}
        <h1 className="text-section-title font-semibold text-fg-primary">{title}</h1>
        {description === undefined ? null : (
          <p className="text-body text-fg-secondary">{description}</p>
        )}
        {action === undefined ? null : <div className="pt-2">{action}</div>}
      </div>
    </main>
  );
}
