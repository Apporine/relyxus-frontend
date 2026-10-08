import { describe, expect, it } from 'vitest';

import {
  areaForPathname,
  areaHref,
  navigationAreaIds,
  navigationGroupsFor,
} from './navigation-model';

describe('navigationGroupsFor', () => {
  it('lists all thirteen destinations in four groups for full access', () => {
    const groups = navigationGroupsFor(new Set(navigationAreaIds));

    expect(groups.map((group) => group.groupId)).toEqual([
      'operate',
      'understand',
      'govern',
      'configure',
    ]);
    expect(groups.flatMap((group) => group.areaIds)).toEqual([...navigationAreaIds]);
  });

  it('hides inaccessible areas without reordering the rest', () => {
    const groups = navigationGroupsFor(
      new Set(['audit', 'incidents', 'command-centre', 'compliance']),
    );

    expect(groups).toEqual([
      { groupId: 'operate', areaIds: ['command-centre', 'incidents'] },
      { groupId: 'govern', areaIds: ['compliance', 'audit'] },
    ]);
  });
});

describe('areaHref', () => {
  it('follows the UI/UX route map', () => {
    expect(areaHref('payments-uk', 'command-centre')).toBe('/w/payments-uk/home');
    expect(areaHref('payments-uk', 'admin')).toBe('/w/payments-uk/settings');
  });

  it('encodes the workspace slug', () => {
    expect(areaHref('payments uk', 'incidents')).toBe('/w/payments%20uk/incidents');
  });
});

describe('areaForPathname', () => {
  it.each([
    ['/w/payments-uk/home', 'command-centre'],
    ['/w/payments-uk/incidents/INC-2041/evidence', 'incidents'],
    ['/w/payments-uk/settings/incident-types', 'admin'],
    ['/w/payments-uk', undefined],
    ['/me/settings', undefined],
  ] as const)('%s belongs to %s', (pathname, expectedArea) => {
    expect(areaForPathname(pathname)).toBe(expectedArea);
  });
});
