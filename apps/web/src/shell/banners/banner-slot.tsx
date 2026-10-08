'use client';

import { Banner } from '@relyxus/ui';
import { useLocale, useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { formattingLocaleFor } from '@/lib/i18n/locales';
import type { LiveConnectionStatus } from '@/lib/live/live-connection';

import type { PlatformCapability, PlatformStatus } from '../platform/platform-status';
import { selectBanners, type ShellBanner } from './select-banners';

function useCapabilityList(): (capabilities: PlatformCapability[]) => string {
  const translateBanners = useTranslations('shell.banners');
  const listFormat = new Intl.ListFormat(formattingLocaleFor(useLocale()), { type: 'conjunction' });
  return (capabilities) =>
    capabilities.length === 0
      ? translateBanners('noCapabilities')
      : listFormat.format(
          capabilities.map((capability) => translateBanners(`capabilities.${capability}`)),
        );
}

function ShellBannerView({ banner }: { banner: ShellBanner }) {
  const translateBanners = useTranslations('shell.banners');
  const format = useRelyxusFormat();
  const capabilityList = useCapabilityList();

  switch (banner.kind) {
    case 'relyxus-down':
    case 'relyxus-degraded': {
      const { capabilities } = banner.platformStatus;
      const working = capabilities.filter((entry) => entry.state === 'working');
      const affected = capabilities.filter((entry) => entry.state !== 'working');
      const description = translateBanners('capabilitySummary', {
        working: capabilityList(working.map((entry) => entry.capability)),
        affected: capabilityList(affected.map((entry) => entry.capability)),
      });
      return banner.kind === 'relyxus-down' ? (
        <Banner
          tone="danger"
          placement="global"
          title={translateBanners('relyxusDown')}
          description={description}
        />
      ) : (
        <Banner
          tone="warning"
          placement="global"
          title={translateBanners('relyxusDegraded')}
          description={description}
        />
      );
    }
    case 'live-connection-lost': {
      const { state, lastEventReceivedAt } = banner.liveStatus;
      const isOffline = state === 'offline';
      const title =
        lastEventReceivedAt === null
          ? translateBanners(
              isOffline ? 'liveOfflineBeforeFirstUpdate' : 'liveReconnectingBeforeFirstUpdate',
            )
          : translateBanners(isOffline ? 'liveOffline' : 'liveReconnecting', {
              time: format.timeOfDay(lastEventReceivedAt, { includeSeconds: true }),
            });
      return (
        <Banner
          tone="warning"
          placement="global"
          title={title}
          description={translateBanners('stateChangesPaused')}
        />
      );
    }
    case 'licence-grace':
      return (
        <Banner
          tone="warning"
          placement="global"
          title={translateBanners('licenceGrace', {
            date: format.dateAndTime(new Date(banner.notice.graceEndsAt)),
          })}
          description={translateBanners('licenceGraceDetail')}
        />
      );
    case 'planned-maintenance':
      return (
        <Banner
          tone="info"
          placement="global"
          title={translateBanners('plannedMaintenance', {
            start: format.dateAndTime(new Date(banner.notice.startsAt)),
            end: format.dateAndTime(new Date(banner.notice.endsAt)),
          })}
        />
      );
  }
}

function bannerKey(banner: ShellBanner): string {
  return banner.kind === 'licence-grace' || banner.kind === 'planned-maintenance'
    ? `${banner.kind}-${banner.notice.id}`
    : banner.kind;
}

/** At most two banners under the top bar, most severe first; none can be dismissed here. */
export function BannerSlot({
  platformStatus,
  liveStatus,
}: {
  platformStatus: PlatformStatus | undefined;
  liveStatus: LiveConnectionStatus;
}) {
  const banners = selectBanners({ platformStatus, liveStatus });
  if (banners.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col">
      {banners.map((banner) => (
        <ShellBannerView key={bannerKey(banner)} banner={banner} />
      ))}
    </div>
  );
}
