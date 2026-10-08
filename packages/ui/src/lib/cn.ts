import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

import {
  obsidianBreakpointNames,
  obsidianColourNames,
  obsidianEaseNames,
  obsidianRadiusNames,
  obsidianTextSizeNames,
} from './theme-names';

/*
 * tailwind-merge has to know the Obsidian theme names. Without them it cannot tell that
 * `text-body` sets a font size while `text-fg-primary` sets a colour, and would silently drop
 * one of the two when both are present.
 */
const mergeTailwindClasses = extendTailwindMerge({
  extend: {
    theme: {
      color: [...obsidianColourNames],
      text: [...obsidianTextSizeNames],
      radius: [...obsidianRadiusNames],
      ease: [...obsidianEaseNames],
      breakpoint: [...obsidianBreakpointNames],
    },
  },
});

/** Joins conditional class names and resolves conflicting Tailwind utilities, last one wins. */
export function cn(...classValues: ClassValue[]): string {
  return mergeTailwindClasses(clsx(classValues));
}
