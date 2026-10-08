import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';

import { RelyxusUiProvider, type TextDirection } from '../provider/relyxus-ui-provider';

export const testToastLabels = { region: 'Notifications', dismiss: 'Dismiss notification' };

/** Renders inside the same provider the apps mount, so Radix context is always present. */
export function renderWithProviders(
  element: ReactElement,
  { direction = 'ltr' }: { direction?: TextDirection } = {},
): RenderResult {
  return render(
    <RelyxusUiProvider direction={direction} toastLabels={testToastLabels}>
      {element}
    </RelyxusUiProvider>,
  );
}
