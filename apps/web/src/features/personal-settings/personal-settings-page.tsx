'use client';

import { RadioGroup, RadioGroupItem } from '@relyxus/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useTransition, type ReactNode } from 'react';

import { policyPageHref } from '@/features/policies/policies-area-navigation';
import { useTimeDisplay } from '@/lib/format/time-display';
import { supportedLocales, type SupportedLocale } from '@/lib/i18n/locales';
import { BoxedFacts, StackedFacts, type Fact } from '@/lib/ui/fact-list';
import { ListDetailLayout, SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { setPreferredLocale } from '@/shell/preferences/set-preferred-locale';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

/*
 * Personal settings (UI/UX s. 13.10, Figma frame 34). Language works today through the
 * locale cookie; the other preferences show the values in force until the user-preferences
 * API exists (open question Q17).
 */
const settingSections = [
  'profile',
  'appearance',
  'language',
  'time',
  'notifications',
  'shortcuts',
] as const;
type SettingSection = (typeof settingSections)[number];

/** Each language is named in itself so it can be found by people who cannot read the other. */
const languageNames = { en: 'English', ar: 'العربية' } satisfies Record<SupportedLocale, string>;

function LanguageChoice() {
  const translateSettings = useTranslations('personalSettings');
  const activeLocale = useLocale();
  const router = useRouter();
  const [isChanging, startChange] = useTransition();
  const labelId = useId();

  function changeLanguage(locale: string) {
    startChange(async () => {
      await setPreferredLocale(locale);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3" aria-busy={isChanging || undefined}>
      <p id={labelId} className="text-meta font-semibold text-fg-tertiary uppercase">
        {translateSettings('language.interfaceLanguage')}
      </p>
      <RadioGroup
        aria-labelledby={labelId}
        value={activeLocale}
        onValueChange={changeLanguage}
        disabled={isChanging}
      >
        {supportedLocales.map((locale) => (
          <label key={locale} lang={locale} className="flex items-center gap-3 text-body">
            <RadioGroupItem value={locale} />
            {languageNames[locale]}
          </label>
        ))}
      </RadioGroup>
      <p className="text-meta text-fg-secondary">{translateSettings('language.help')}</p>
    </div>
  );
}

function SectionContent({ section }: { section: SettingSection }) {
  const translateSettings = useTranslations('personalSettings');
  const { user, workspace } = useCurrentWorkspace();
  const { preferredTimeZone } = useTimeDisplay();

  const factsBySection: Record<SettingSection, Fact[] | ReactNode> = {
    profile: [
      { label: translateSettings('profile.name'), value: user.displayName },
      { label: translateSettings('profile.email'), value: user.email },
      {
        label: translateSettings('profile.source'),
        value: translateSettings('profile.sourceValue'),
      },
    ],
    appearance: [
      {
        label: translateSettings('appearance.theme'),
        value: translateSettings('appearance.themeValue'),
      },
      {
        label: translateSettings('appearance.density'),
        value: translateSettings('appearance.densityValue'),
      },
      {
        label: translateSettings('appearance.warRoomPanels'),
        value: translateSettings('appearance.warRoomPanelsValue'),
      },
      { label: translateSettings('appearance.languageFont'), value: 'IBM Plex Sans Variable' },
      { label: translateSettings('appearance.technicalFont'), value: 'JetBrains Mono' },
      {
        label: translateSettings('appearance.motion'),
        value: translateSettings('appearance.motionValue'),
      },
    ],
    language: <LanguageChoice />,
    time: [
      { label: translateSettings('time.zone'), value: preferredTimeZone },
      {
        label: translateSettings('time.utcToggle'),
        value: translateSettings('time.utcToggleValue'),
      },
      { label: translateSettings('time.digits'), value: translateSettings('time.digitsValue') },
    ],
    notifications: [
      {
        label: translateSettings('notifications.rules'),
        value: (
          <Link
            href={policyPageHref(workspace.slug, 'notification-rules')}
            className="font-semibold underline underline-offset-2"
          >
            {translateSettings('notifications.rulesLink')}
          </Link>
        ),
      },
      {
        label: translateSettings('notifications.quietHours'),
        value: translateSettings('notifications.quietHoursValue'),
      },
    ],
    shortcuts: [
      {
        label: translateSettings('shortcuts.status'),
        value: translateSettings('shortcuts.statusValue'),
      },
      {
        label: translateSettings('shortcuts.reference'),
        value: translateSettings('shortcuts.referenceValue'),
      },
    ],
  };
  const content = factsBySection[section];

  return (
    <Panel title={translateSettings(`sections.${section}`)}>
      {Array.isArray(content) ? <BoxedFacts facts={content} /> : content}
    </Panel>
  );
}

/** Visual accessibility guarantees that apply whatever the person chooses (UI/UX s. 6). */
function AccessibilityPreview() {
  const translateSettings = useTranslations('personalSettings');
  return (
    <Panel title={translateSettings('preview.title')}>
      <StackedFacts
        facts={[
          {
            label: translateSettings('preview.contrast'),
            value: translateSettings('preview.contrastValue'),
          },
          {
            label: translateSettings('preview.focus'),
            value: translateSettings('preview.focusValue'),
          },
          {
            label: translateSettings('preview.tableRow'),
            value: translateSettings('preview.tableRowValue'),
          },
          {
            label: translateSettings('preview.scope'),
            value: translateSettings('preview.scopeValue'),
          },
        ]}
      />
    </Panel>
  );
}

export function PersonalSettingsPage() {
  const translateSettings = useTranslations('personalSettings');
  const { selectedId, hrefFor } = useUrlSelection('section', settingSections);
  const section = settingSections.find((candidate) => candidate === selectedId) ?? 'profile';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateSettings('title')}
        description={translateSettings('description')}
      />
      <ListDetailLayout
        list={
          <SelectableListPanel
            title={translateSettings('listTitle')}
            emptyText=""
            selectedId={section}
            hrefFor={hrefFor}
            items={settingSections.map((settingSection) => ({
              id: settingSection,
              title: translateSettings(`sections.${settingSection}`),
              meta: translateSettings(`summaries.${settingSection}`),
            }))}
          />
        }
        detail={<SectionContent section={section} />}
        aside={<AccessibilityPreview />}
      />
    </div>
  );
}
