// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import obsidianTokens from './obsidian.tokens.json';

const tokensStylesheet = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8');

const WCAG_TEXT_MINIMUM = 4.5;
const WCAG_NON_TEXT_MINIMUM = 3;

// Obsidian design-token keys mapped to the custom property names used in code.
const colourPropertyByDesignKey: Record<keyof typeof obsidianTokens.color, string> = {
  canvas: '--rx-canvas',
  nav: '--rx-nav',
  s1: '--rx-surface-1',
  s2: '--rx-surface-2',
  raised: '--rx-raised',
  sel: '--rx-selected',
  div: '--rx-divider',
  control: '--rx-control',
  strong: '--rx-strong',
  p: '--rx-fg-primary',
  s: '--rx-fg-secondary',
  t: '--rx-fg-tertiary',
  action: '--rx-action',
  actxt: '--rx-action-fg',
  critical: '--rx-critical',
  major: '--rx-major',
  warning: '--rx-warning',
  healthy: '--rx-healthy',
  ai: '--rx-ai',
  neutral: '--rx-neutral',
};

const radiusPropertyByDesignKey: Record<keyof typeof obsidianTokens.radius, string> = {
  control: '--rx-radius-control',
  button: '--rx-radius-button',
  panel: '--rx-radius-panel',
  dialog: '--rx-radius-dialog',
};

function readCustomProperty(propertyName: string): string {
  const declaration = new RegExp(`${propertyName}:\\s*([^;]+);`).exec(tokensStylesheet);
  if (!declaration?.[1]) {
    throw new Error(`${propertyName} is not declared in tokens.css`);
  }
  return declaration[1].trim();
}

function relativeLuminance(hexColour: string): number {
  const channels = [1, 3, 5].map((offset) => {
    const value = Number.parseInt(hexColour.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [red = 0, green = 0, blue = 0] = channels;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(firstHex: string, secondHex: string): number {
  const [lighter, darker] = [relativeLuminance(firstHex), relativeLuminance(secondHex)].sort(
    (first, second) => second - first,
  ) as [number, number];
  return (lighter + 0.05) / (darker + 0.05);
}

const surfaceProperties = [
  '--rx-canvas',
  '--rx-nav',
  '--rx-surface-1',
  '--rx-surface-2',
  '--rx-raised',
  '--rx-selected',
];

describe('Obsidian token parity', () => {
  it.each(Object.entries(colourPropertyByDesignKey))(
    'colour %s matches the design package',
    (designKey, propertyName) => {
      const designValue = obsidianTokens.color[designKey as keyof typeof obsidianTokens.color];
      expect(readCustomProperty(propertyName).toLowerCase()).toBe(designValue.value.toLowerCase());
    },
  );

  it.each(Object.entries(radiusPropertyByDesignKey))(
    'radius %s matches the design package',
    (designKey, propertyName) => {
      const designValue = obsidianTokens.radius[designKey as keyof typeof obsidianTokens.radius];
      expect(readCustomProperty(propertyName)).toBe(`${designValue.value}px`);
    },
  );
});

describe('WCAG 2.2 AA contrast', () => {
  const textProperties = [
    '--rx-fg-primary',
    '--rx-fg-secondary',
    '--rx-fg-tertiary',
    '--rx-critical',
    '--rx-major',
    '--rx-warning',
    '--rx-healthy',
    '--rx-neutral',
    '--rx-ai',
  ];

  it.each(textProperties.flatMap((text) => surfaceProperties.map((surface) => [text, surface])))(
    '%s text on %s meets 4.5:1',
    (textProperty, surfaceProperty) => {
      const ratio = contrastRatio(
        readCustomProperty(textProperty),
        readCustomProperty(surfaceProperty),
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_TEXT_MINIMUM);
    },
  );

  it('primary action text meets 4.5:1 on the primary action fill', () => {
    const ratio = contrastRatio(
      readCustomProperty('--rx-action-fg'),
      readCustomProperty('--rx-action'),
    );
    expect(ratio).toBeGreaterThanOrEqual(WCAG_TEXT_MINIMUM);
  });

  it.each(['--rx-critical', '--rx-major', '--rx-warning', '--rx-neutral', '--rx-healthy'])(
    'dark badge text meets 4.5:1 on a filled %s badge',
    (fillProperty) => {
      const ratio = contrastRatio(
        readCustomProperty('--rx-action-fg'),
        readCustomProperty(fillProperty),
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_TEXT_MINIMUM);
    },
  );

  // Inputs and checkboxes sit on canvas, surface or raised backgrounds; their boundary must
  // reach 3:1. Selected rows do not host empty inputs.
  it.each(['--rx-canvas', '--rx-nav', '--rx-surface-1', '--rx-surface-2', '--rx-raised'])(
    'strong border meets 3:1 as an input boundary on %s',
    (surfaceProperty) => {
      const ratio = contrastRatio(
        readCustomProperty('--rx-strong'),
        readCustomProperty(surfaceProperty),
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_NON_TEXT_MINIMUM);
    },
  );
});
