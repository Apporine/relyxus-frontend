'use client';

import { useEffect, useEffectEvent, useRef } from 'react';

import type { NavigationAreaId } from '../navigation/navigation-model';

/*
 * Global shortcuts from UI/UX s. 8. Letter shortcuts never fire while the person is typing in
 * a field, and never combine with modifiers, so they cannot clash with browser or assistive
 * technology shortcuts. Ctrl or Cmd + K works everywhere because it inserts no text.
 */

/** Second key after G, for example G then I opens incidents. */
const goToShortcutAreas: Readonly<Record<string, NavigationAreaId>> = {
  h: 'command-centre',
  i: 'incidents',
  a: 'approvals',
};

/** How long after G the second key is accepted. */
const SEQUENCE_TIMEOUT_MS = 1_500;

export type GlobalShortcutHandlers = {
  onOpenCommandPalette: () => void;
  onShowShortcuts: () => void;
  onGoToArea: (areaId: NavigationAreaId) => void;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.getAttribute('role') === 'combobox'
  );
}

export function useGlobalShortcuts(handlers: GlobalShortcutHandlers): void {
  const goSequenceStartedAt = useRef<number | null>(null);

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      handlers.onOpenCommandPalette();
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) {
      return;
    }

    const pressedKey = event.key.toLowerCase();
    const sequenceStartedAt = goSequenceStartedAt.current;
    goSequenceStartedAt.current = null;

    if (sequenceStartedAt !== null && event.timeStamp - sequenceStartedAt <= SEQUENCE_TIMEOUT_MS) {
      const targetArea = goToShortcutAreas[pressedKey];
      if (targetArea !== undefined) {
        event.preventDefault();
        handlers.onGoToArea(targetArea);
        return;
      }
    }

    if (event.key === '?') {
      event.preventDefault();
      handlers.onShowShortcuts();
    } else if (pressedKey === 'g') {
      goSequenceStartedAt.current = event.timeStamp;
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, []);
}
