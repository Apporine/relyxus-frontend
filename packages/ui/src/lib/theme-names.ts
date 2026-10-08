/*
 * Names of the Obsidian utilities defined in styles/theme.css. theme-names.test.ts fails if
 * this list and the stylesheet drift apart.
 */

export const obsidianColourNames = [
  'canvas',
  'nav',
  'surface-1',
  'surface-2',
  'raised',
  'selected',
  'divider',
  'control',
  'strong',
  'fg-primary',
  'fg-secondary',
  'fg-tertiary',
  'action',
  'action-fg',
  'focus',
  'critical',
  'major',
  'warning',
  'healthy',
  'neutral',
  'ai',
  'critical-subtle',
  'major-subtle',
  'warning-subtle',
  'healthy-subtle',
  'neutral-subtle',
] as const;

export const obsidianTextSizeNames = [
  'page-title',
  'section-title',
  'panel-title',
  'body',
  'table',
  'meta',
  'metric',
] as const;

export const obsidianRadiusNames = ['control', 'button', 'panel', 'dialog'] as const;

export const obsidianEaseNames = ['standard'] as const;

export const obsidianBreakpointNames = ['tablet', 'laptop', 'desktop', 'wall'] as const;
