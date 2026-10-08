import type { LiveConnectionStatus } from '@/lib/live/live-connection';

import type { PlatformNotice, PlatformStatus } from '../platform/platform-status';

/*
 * The banner slot shows at most two banners, most severe first; critical banners cannot be
 * dismissed (UI/UX s. 4).
 */

export const MAX_VISIBLE_BANNERS = 2;

export type ShellBanner =
  | { kind: 'relyxus-down'; platformStatus: PlatformStatus }
  | { kind: 'relyxus-degraded'; platformStatus: PlatformStatus }
  | { kind: 'live-connection-lost'; liveStatus: LiveConnectionStatus }
  | { kind: 'licence-grace'; notice: Extract<PlatformNotice, { kind: 'licence-grace' }> }
  | {
      kind: 'planned-maintenance';
      notice: Extract<PlatformNotice, { kind: 'planned-maintenance' }>;
    };

const bannerSeverityRank = {
  'relyxus-down': 0,
  'relyxus-degraded': 1,
  'live-connection-lost': 2,
  'licence-grace': 3,
  'planned-maintenance': 4,
} satisfies Record<ShellBanner['kind'], number>;

export function selectBanners({
  platformStatus,
  liveStatus,
}: {
  platformStatus: PlatformStatus | undefined;
  liveStatus: LiveConnectionStatus;
}): ShellBanner[] {
  const candidates: ShellBanner[] = [];

  if (platformStatus?.health === 'down') {
    candidates.push({ kind: 'relyxus-down', platformStatus });
  } else if (platformStatus?.health === 'degraded') {
    candidates.push({ kind: 'relyxus-degraded', platformStatus });
  }

  if (liveStatus.state === 'reconnecting' || liveStatus.state === 'offline') {
    candidates.push({ kind: 'live-connection-lost', liveStatus });
  }

  platformStatus?.notices.forEach((notice) => {
    if (notice.kind === 'licence-grace') {
      candidates.push({ kind: 'licence-grace', notice });
    } else {
      candidates.push({ kind: 'planned-maintenance', notice });
    }
  });

  return candidates
    .sort((first, second) => bannerSeverityRank[first.kind] - bannerSeverityRank[second.kind])
    .slice(0, MAX_VISIBLE_BANNERS);
}
