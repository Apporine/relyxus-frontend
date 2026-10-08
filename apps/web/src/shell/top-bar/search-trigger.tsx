'use client';

import { KeyboardHint } from '@relyxus/ui';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

/** Opens the command palette; also reachable with Ctrl or Cmd + K from anywhere. */
export function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  const translateTopBar = useTranslations('shell.topBar');

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="flex h-9 w-full max-w-md items-center gap-2 rounded-button border border-control bg-surface-1 ps-3 pe-1.5 text-table text-fg-tertiary hover:border-strong"
    >
      <Search aria-hidden className="size-4 shrink-0" />
      <span className="flex-1 truncate text-start">{translateTopBar('searchPlaceholder')}</span>
      <KeyboardHint keys={['Ctrl', 'K']} className="hidden laptop:inline-flex" />
    </button>
  );
}
