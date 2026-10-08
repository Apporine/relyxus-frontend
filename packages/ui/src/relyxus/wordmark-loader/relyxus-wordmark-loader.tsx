import { cn } from '../../lib/cn';

const WORDMARK = 'Relyxus';

export type RelyxusWordmarkLoaderProps = {
  className?: string;
  /** Screen-reader label; defaults to "Loading". */
  label?: string;
};

/**
 * Branded loading indicator for first boot and session load. Each letter pulses in sequence so
 * the wordmark stays readable without a decorative spinner.
 */
export function RelyxusWordmarkLoader({
  className,
  label = 'Loading',
}: RelyxusWordmarkLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn('inline-flex items-center', className)}
    >
      <span aria-hidden className="inline-flex text-page-title font-semibold tracking-tight">
        {WORDMARK.split('').map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="animate-relyxus-wordmark text-fg-primary"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            {letter}
          </span>
        ))}
      </span>
    </div>
  );
}
