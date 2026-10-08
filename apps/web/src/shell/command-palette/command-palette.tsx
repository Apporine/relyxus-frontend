'use client';

import { cn, Dialog, DialogContent, DialogTitle } from '@relyxus/ui';
import { CornerDownLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useId, useMemo, useState, type KeyboardEvent } from 'react';

import { useCurrentWorkspace } from '../workspace/current-workspace';
import {
  filterPaletteCommands,
  paletteCommandsFor,
  type PaletteCommand,
  type PaletteCommandGroup,
} from './palette-commands';

const commandGroupOrder: PaletteCommandGroup[] = ['actions', 'navigate'];

type CommandPaletteProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

/**
 * Ctrl or Cmd + K (UI/UX s. 4 and 8). An ARIA combobox: focus stays in the input while
 * arrow keys move the active option, Enter runs it and Escape closes the palette.
 */
export function CommandPalette({ isOpen, onOpenChange }: CommandPaletteProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {isOpen ? <CommandPaletteContent onClose={() => onOpenChange(false)} /> : null}
    </Dialog>
  );
}

function CommandPaletteContent({ onClose }: { onClose: () => void }) {
  const translatePalette = useTranslations('shell.commandPalette');
  const translateShortcuts = useTranslations('shell.shortcuts');
  const translateAreas = useTranslations('shell.navigation.areas');
  const locale = useLocale();
  const router = useRouter();
  const { workspace, accessibleAreaIds } = useCurrentWorkspace();
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const allCommands = useMemo(
    () =>
      paletteCommandsFor({
        workspaceSlug: workspace.slug,
        accessibleAreaIds,
        labelForArea: (areaId) => translateAreas(areaId),
        declareIncidentLabel: translatePalette('declareIncident'),
      }),
    [workspace.slug, accessibleAreaIds, translateAreas, translatePalette],
  );
  const matchingCommands = filterPaletteCommands(allCommands, query, locale);
  const activeCommand = matchingCommands[Math.min(activeIndex, matchingCommands.length - 1)];

  function runCommand(command: PaletteCommand) {
    onClose();
    router.push(command.href);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const lastIndex = matchingCommands.length - 1;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current >= lastIndex ? 0 : current + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? lastIndex : current - 1));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setActiveIndex(lastIndex);
    } else if (event.key === 'Enter' && activeCommand !== undefined) {
      event.preventDefault();
      runCommand(activeCommand);
    }
  }

  const optionId = (command: PaletteCommand) => `${listboxId}-${command.id}`;

  return (
    <DialogContent
      closeLabel={translateShortcuts('closeDialog')}
      className="top-[12vh] translate-y-0 overflow-hidden"
      aria-describedby={undefined}
    >
      <DialogTitle className="sr-only">{translatePalette('title')}</DialogTitle>
      <div className="flex items-center gap-3 border-b border-divider px-4 pe-14">
        <Search aria-hidden className="size-5 shrink-0 text-fg-secondary" />
        <input
          role="combobox"
          aria-label={translatePalette('inputLabel')}
          aria-expanded
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeCommand === undefined ? undefined : optionId(activeCommand)}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={translatePalette('inputLabel')}
          className="h-14 w-full bg-transparent text-body text-fg-primary outline-none placeholder:text-fg-tertiary"
        />
      </div>

      <div
        id={listboxId}
        role="listbox"
        aria-label={translatePalette('title')}
        className="max-h-96 overflow-y-auto p-2"
      >
        {matchingCommands.length === 0 ? (
          <p className="px-3 py-6 text-center text-body text-fg-secondary">
            {translatePalette('noResults', { query })}
          </p>
        ) : (
          commandGroupOrder.map((group) => {
            const groupCommands = matchingCommands.filter((command) => command.group === group);
            if (groupCommands.length === 0) {
              return null;
            }
            const groupHeadingId = `${listboxId}-${group}`;
            return (
              <div key={group} role="group" aria-labelledby={groupHeadingId} className="pb-2">
                <p
                  id={groupHeadingId}
                  className="px-3 py-1.5 text-meta font-semibold text-fg-tertiary uppercase"
                >
                  {translatePalette(`groups.${group}`)}
                </p>
                {groupCommands.map((command) => {
                  const isActive = command.id === activeCommand?.id;
                  return (
                    <div
                      key={command.id}
                      id={optionId(command)}
                      role="option"
                      aria-selected={isActive}
                      onPointerMove={() => setActiveIndex(matchingCommands.indexOf(command))}
                      onClick={() => runCommand(command)}
                      className={cn(
                        'flex h-10 cursor-pointer items-center justify-between rounded-control px-3 text-body',
                        isActive ? 'bg-selected text-fg-primary' : 'text-fg-secondary',
                      )}
                    >
                      {command.label}
                      {isActive ? (
                        <CornerDownLeft
                          aria-hidden
                          className="size-4 text-fg-tertiary rtl:-scale-x-100"
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </DialogContent>
  );
}
