import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('keeps a font size and a text colour that use Obsidian names', () => {
    expect(cn('text-body', 'text-fg-primary')).toBe('text-body text-fg-primary');
  });

  it('lets the later text colour win', () => {
    expect(cn('text-fg-primary', 'text-fg-secondary')).toBe('text-fg-secondary');
  });

  it('lets the later font size win', () => {
    expect(cn('text-body', 'text-meta')).toBe('text-meta');
  });

  it('lets the later radius win', () => {
    expect(cn('rounded-button', 'rounded-panel')).toBe('rounded-panel');
  });

  it('drops falsy conditional classes', () => {
    const isSelected = false;
    expect(cn('bg-surface-1', isSelected && 'bg-selected')).toBe('bg-surface-1');
  });
});
