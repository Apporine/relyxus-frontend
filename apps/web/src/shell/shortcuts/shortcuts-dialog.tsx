'use client';

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  KeyboardHint,
} from '@relyxus/ui';
import { useTranslations } from 'next-intl';

type ShortcutDescription = {
  keys: readonly string[];
  isSequence: boolean;
  descriptionKey:
    'commandPalette' | 'goHome' | 'goIncidents' | 'goApprovals' | 'showShortcuts' | 'closeOverlay';
};

/** Shortcuts available everywhere; screen-specific shortcuts are listed by their screens. */
const globalShortcuts: readonly ShortcutDescription[] = [
  { keys: ['Ctrl', 'K'], isSequence: false, descriptionKey: 'commandPalette' },
  { keys: ['G', 'H'], isSequence: true, descriptionKey: 'goHome' },
  { keys: ['G', 'I'], isSequence: true, descriptionKey: 'goIncidents' },
  { keys: ['G', 'A'], isSequence: true, descriptionKey: 'goApprovals' },
  { keys: ['?'], isSequence: false, descriptionKey: 'showShortcuts' },
  { keys: ['Esc'], isSequence: false, descriptionKey: 'closeOverlay' },
];

export function ShortcutsDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const translateShortcuts = useTranslations('shell.shortcuts');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={translateShortcuts('closeDialog')} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{translateShortcuts('title')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <dl className="flex flex-col divide-y divide-divider">
            {globalShortcuts.map(({ keys, isSequence, descriptionKey }) => (
              <div key={descriptionKey} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-body text-fg-primary">{translateShortcuts(descriptionKey)}</dt>
                <dd>
                  <KeyboardHint
                    keys={keys}
                    separator={isSequence ? translateShortcuts('then') : undefined}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
