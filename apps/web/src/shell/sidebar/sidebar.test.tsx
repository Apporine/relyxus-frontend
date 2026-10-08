import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { navigationState, nextNavigationMock } from '@/test/next-navigation-mock';
import { renderInWorkspace } from '@/test/render-in-workspace';

import { Sidebar } from './sidebar';

vi.mock('next/navigation', () => nextNavigationMock);

describe('Sidebar', () => {
  beforeEach(() => {
    navigationState.currentPathname = '/w/payments-uk/incidents/INC-2041';
  });

  it('lists the thirteen destinations in four groups', () => {
    renderInWorkspace(<Sidebar isCollapsed={false} onToggleCollapsed={vi.fn()} />);

    const navigation = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(navigation).getAllByRole('link')).toHaveLength(13);
    expect(
      within(navigation)
        .getAllByRole('heading')
        .map((heading) => heading.textContent),
    ).toEqual(['Operate', 'Understand', 'Govern', 'Configure']);
  });

  it('marks the area of the current page', () => {
    renderInWorkspace(<Sidebar isCollapsed={false} onToggleCollapsed={vi.fn()} />);

    expect(screen.getByRole('link', { name: 'Incidents' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Incidents' })).toHaveAttribute(
      'href',
      '/w/payments-uk/incidents',
    );
  });

  it('hides areas the person cannot open without reordering the rest', () => {
    renderInWorkspace(<Sidebar isCollapsed={false} onToggleCollapsed={vi.fn()} />, {
      accessibleAreas: ['audit', 'command-centre', 'incidents'],
    });

    const navigation = screen.getByRole('navigation', { name: 'Primary' });
    expect(
      within(navigation)
        .getAllByRole('link')
        .map((link) => link.textContent),
    ).toEqual(['Command Centre', 'Incidents', 'Audit']);
  });

  it('keeps every destination named when collapsed', () => {
    renderInWorkspace(<Sidebar isCollapsed onToggleCollapsed={vi.fn()} />);

    expect(screen.getByRole('link', { name: 'Compliance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('uses Arabic labels in right-to-left layouts', () => {
    renderInWorkspace(<Sidebar isCollapsed={false} onToggleCollapsed={vi.fn()} />, {
      locale: 'ar',
    });

    expect(screen.getByRole('link', { name: 'الحوادث' })).toHaveAttribute('aria-current', 'page');
  });
});
