import { cn } from '../../lib/cn';
import { CopyButton, type CopyButtonProps } from '../copy-button/copy-button';

/** Blocks longer than this show line numbers so people can refer to a specific line. */
const LINE_NUMBER_THRESHOLD = 10;

export type CodeBlockProps = {
  /** Queries, log lines, commands or JSON. Always rendered left-to-right in JetBrains Mono. */
  code: string;
  /** Accessible name of the block, for example "PromQL query". */
  label: string;
  copyLabels?: Pick<CopyButtonProps, 'label' | 'copiedLabel' | 'failedLabel'>;
  className?: string;
};

export function CodeBlock({ code, label, copyLabels, className }: CodeBlockProps) {
  const lines = code.split('\n');
  const showsLineNumbers = lines.length > LINE_NUMBER_THRESHOLD;

  return (
    <figure className={cn('relative rounded-panel border border-divider bg-surface-1', className)}>
      {copyLabels === undefined ? null : (
        <div className="absolute end-2 top-2">
          <CopyButton value={code} {...copyLabels} />
        </div>
      )}
      {/* tabIndex makes horizontal overflow keyboard-operable (WCAG 2.2 scrollable-region-focusable). */}
      <div
        dir="ltr"
        role="region"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scroll container, not a control
        tabIndex={0}
        aria-label={label}
        className={cn('overflow-x-auto', copyLabels && 'pe-12')}
      >
        <pre className="p-3 font-mono text-table text-fg-primary">
          {showsLineNumbers ? (
            <code className="grid grid-cols-[auto_1fr] gap-x-4">
              {lines.map((line, index) => (
                <span key={index} className="contents">
                  <span aria-hidden className="text-end text-fg-tertiary tabular-nums select-none">
                    {index + 1}
                  </span>
                  <span>{line}</span>
                </span>
              ))}
            </code>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </figure>
  );
}
