/*
 * Letter shortcuts never fire while someone is typing in a field and never combine with
 * modifier keys, so they cannot clash with browser or assistive technology shortcuts
 * (UI/UX s. 8).
 */

export function isTypingTarget(target: EventTarget | null): boolean {
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

/** True when a plain key press may trigger a single-letter shortcut. */
export function mayRunLetterShortcut(event: KeyboardEvent): boolean {
  return (
    !event.defaultPrevented &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !isTypingTarget(event.target)
  );
}
