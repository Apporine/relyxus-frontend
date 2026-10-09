import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithIntl } from '@/test/render-with-intl';

import { RouteLoadingState } from './route-loading-state';

describe('RouteLoadingState', () => {
  it('announces that the next page is loading, in the reader’s language', () => {
    renderWithIntl(<RouteLoadingState />, { locale: 'ar' });

    expect(screen.getByRole('status', { name: 'جارٍ تحميل الصفحة' })).toBeInTheDocument();
  });
});
