// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import {
  obsidianBreakpointNames,
  obsidianColourNames,
  obsidianEaseNames,
  obsidianRadiusNames,
  obsidianTextSizeNames,
} from './theme-names';

const themeStylesheet = readFileSync(new URL('../styles/theme.css', import.meta.url), 'utf8');

function declaredThemeNames(namespace: string): string[] {
  const declaration = new RegExp(`--${namespace}-([a-z0-9-]+):`, 'g');
  const names = [...themeStylesheet.matchAll(declaration)]
    .map((match) => match[1] ?? '')
    .filter((name) => !name.endsWith('-') && !name.includes('--'));
  return [...new Set(names)].sort();
}

describe('Obsidian theme names', () => {
  it.each([
    ['color', obsidianColourNames],
    ['text', obsidianTextSizeNames],
    ['radius', obsidianRadiusNames],
    ['ease', obsidianEaseNames],
    ['breakpoint', obsidianBreakpointNames],
  ] as const)('%s names match theme.css', (namespace, names) => {
    expect([...names].sort()).toEqual(declaredThemeNames(namespace));
  });
});
