import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { CodeBlock } from './code-block';

describe('CodeBlock', () => {
  it('stays left-to-right inside a right-to-left page', () => {
    renderWithProviders(
      <CodeBlock code="kubectl rollout restart deployment/payments-api" label="Command" />,
      {
        direction: 'rtl',
      },
    );
    expect(screen.getByRole('figure', { name: 'Command' })).toHaveAttribute('dir', 'ltr');
  });

  it('omits line numbers for short blocks', () => {
    renderWithProviders(<CodeBlock code={'line one\nline two'} label="Log sample" />);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('numbers the lines of long blocks', () => {
    const logLines = Array.from(
      { length: 12 },
      (_, index) => `12:04:${10 + index} payments-api 503`,
    );
    renderWithProviders(<CodeBlock code={logLines.join('\n')} label="Log sample" />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('12:04:21 payments-api 503')).toBeInTheDocument();
  });
});
