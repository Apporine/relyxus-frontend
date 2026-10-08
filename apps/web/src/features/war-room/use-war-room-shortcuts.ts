'use client';

import { useEffect, useEffectEvent } from 'react';

import { mayRunLetterShortcut } from '@/lib/ui/keyboard-shortcut-guard';

/*
 * War room shortcuts (UI/UX s. 8): A acknowledges, E opens the evidence explorer. N, T and H
 * join with the note, task and handoff controls. Acknowledge is level 0 on the confirmation
 * ladder, so a single key is allowed; no single key ever approves or runs an action.
 */
export function useWarRoomShortcuts({
  onAcknowledge,
  onOpenEvidence,
}: {
  onAcknowledge: () => void;
  onOpenEvidence: () => void;
}): void {
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!mayRunLetterShortcut(event)) {
      return;
    }
    const pressedKey = event.key.toLowerCase();
    if (pressedKey === 'a') {
      event.preventDefault();
      onAcknowledge();
    } else if (pressedKey === 'e') {
      event.preventDefault();
      onOpenEvidence();
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, []);
}
