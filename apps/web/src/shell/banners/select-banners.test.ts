import { describe, expect, it } from 'vitest';

import type { LiveConnectionStatus } from '@/lib/live/live-connection';

import type { PlatformStatus } from '../platform/platform-status';
import { selectBanners } from './select-banners';

const openConnection: LiveConnectionStatus = {
  state: 'open',
  transport: 'websocket',
  lastEventReceivedAt: null,
};

const healthyPlatform: PlatformStatus = { health: 'healthy', capabilities: [], notices: [] };

const licenceGrace = {
  kind: 'licence-grace',
  id: 'licence-2026',
  graceEndsAt: '2026-10-20T00:00:00Z',
} as const;

const maintenance = {
  kind: 'planned-maintenance',
  id: 'maintenance-12-oct',
  startsAt: '2026-10-12T02:00:00Z',
  endsAt: '2026-10-12T03:00:00Z',
} as const;

describe('selectBanners', () => {
  it('shows nothing when Relyxus is healthy and connected', () => {
    expect(selectBanners({ platformStatus: healthyPlatform, liveStatus: openConnection })).toEqual(
      [],
    );
  });

  it('shows a lost live connection while reconnecting or offline', () => {
    const banners = selectBanners({
      platformStatus: healthyPlatform,
      liveStatus: { ...openConnection, state: 'reconnecting' },
    });
    expect(banners.map((banner) => banner.kind)).toEqual(['live-connection-lost']);
  });

  it('keeps the two most severe banners, most severe first', () => {
    const banners = selectBanners({
      platformStatus: {
        health: 'degraded',
        capabilities: [],
        notices: [maintenance, licenceGrace],
      },
      liveStatus: { ...openConnection, state: 'offline' },
    });

    expect(banners.map((banner) => banner.kind)).toEqual([
      'relyxus-degraded',
      'live-connection-lost',
    ]);
  });

  it('ranks notices below platform health', () => {
    const banners = selectBanners({
      platformStatus: { health: 'healthy', capabilities: [], notices: [maintenance, licenceGrace] },
      liveStatus: openConnection,
    });

    expect(banners.map((banner) => banner.kind)).toEqual(['licence-grace', 'planned-maintenance']);
  });

  it('shows a platform outage before everything else', () => {
    const banners = selectBanners({
      platformStatus: { health: 'down', capabilities: [], notices: [licenceGrace] },
      liveStatus: openConnection,
    });

    expect(banners[0]?.kind).toBe('relyxus-down');
  });
});
