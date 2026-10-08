import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Runs axe-core against a rendered container and fails with the rule identifiers and
 * offending selectors, so a violation is diagnosable from the test output alone.
 *
 * Colour contrast is checked separately against the token values in tokens.test.ts because
 * jsdom does not compute styles from Tailwind classes.
 */
export async function expectNoAccessibilityViolations(container: Element): Promise<void> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  const violationSummaries = results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
  );
  expect(violationSummaries).toEqual([]);
}
