import { Check, Copy, TriangleAlert } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { IconButton } from '../button/icon-button';

const FEEDBACK_VISIBLE_MS = 2_000;

type CopyOutcome = 'idle' | 'copied' | 'failed';

export type CopyButtonProps = {
  /** Text placed on the clipboard, for example a query or an incident reference. */
  value: string;
  label: string;
  copiedLabel: string;
  /** Shown when the browser refuses clipboard access, for example outside a secure context. */
  failedLabel: string;
  className?: string;
};

export function CopyButton({ value, label, copiedLabel, failedLabel, className }: CopyButtonProps) {
  const [copyOutcome, setCopyOutcome] = useState<CopyOutcome>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  async function copyValue() {
    clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(value);
      setCopyOutcome('copied');
    } catch {
      setCopyOutcome('failed');
    }
    resetTimer.current = setTimeout(() => setCopyOutcome('idle'), FEEDBACK_VISIBLE_MS);
  }

  const outcomeLabel = { idle: label, copied: copiedLabel, failed: failedLabel }[copyOutcome];
  const outcomeIcon = {
    idle: <Copy />,
    copied: <Check className="text-healthy" />,
    failed: <TriangleAlert className="text-warning" />,
  }[copyOutcome];

  return (
    <>
      <IconButton
        label={outcomeLabel}
        icon={outcomeIcon}
        size="small"
        onClick={copyValue}
        className={className}
      />
      <span role="status" className="sr-only">
        {copyOutcome === 'idle' ? '' : outcomeLabel}
      </span>
    </>
  );
}
