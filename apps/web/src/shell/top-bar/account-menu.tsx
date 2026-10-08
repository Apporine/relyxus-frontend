'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@relyxus/ui';
import { Check, Keyboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { supportedLocales, type SupportedLocale } from '@/lib/i18n/locales';

import { setPreferredLocale } from '../preferences/set-preferred-locale';
import { useCurrentWorkspace } from '../workspace/current-workspace';

/** Each language is named in itself so it can be found by people who cannot read the other. */
const languageNames = {
  en: 'English',
  ar: 'العربية',
} satisfies Record<SupportedLocale, string>;

function initialsOf(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter((namePart) => namePart.length > 0)
    .slice(0, 2)
    .map((namePart) => namePart.charAt(0).toUpperCase())
    .join('');
}

export function AccountMenu({ onOpenShortcuts }: { onOpenShortcuts: () => void }) {
  const translateTopBar = useTranslations('shell.topBar');
  const activeLocale = useLocale();
  const router = useRouter();
  const [isChangingLanguage, startLanguageChange] = useTransition();
  const { user } = useCurrentWorkspace();

  function changeLanguage(locale: SupportedLocale) {
    startLanguageChange(async () => {
      await setPreferredLocale(locale);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={translateTopBar('accountMenu', { name: user.displayName })}
        className="flex size-9 items-center justify-center rounded-full border border-control bg-surface-2 text-table font-semibold hover:border-strong"
      >
        <span aria-hidden>{initialsOf(user.displayName)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 normal-case">
          <span className="text-body font-semibold text-fg-primary">{user.displayName}</span>
          <span className="truncate font-normal">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onOpenShortcuts}>
          <Keyboard aria-hidden />
          {translateTopBar('keyboardShortcuts')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup aria-busy={isChangingLanguage || undefined}>
          <DropdownMenuLabel>{translateTopBar('language')}</DropdownMenuLabel>
          {supportedLocales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              lang={locale}
              disabled={isChangingLanguage}
              onSelect={() => changeLanguage(locale)}
            >
              <span className="flex-1">{languageNames[locale]}</span>
              {locale === activeLocale ? <Check aria-hidden /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
