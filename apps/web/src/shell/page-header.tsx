import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  /** The page's primary action, for example "Declare incident". One primary per region. */
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-page-title font-semibold text-fg-primary">{title}</h1>
        {description === undefined ? null : (
          <p className="text-body text-fg-secondary">{description}</p>
        )}
      </div>
      {actions === undefined ? null : <div className="flex shrink-0 gap-3">{actions}</div>}
    </header>
  );
}
