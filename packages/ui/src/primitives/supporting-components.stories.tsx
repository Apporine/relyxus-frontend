import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Ellipsis } from 'lucide-react';

import { Button } from './button/button';
import { IconButton } from './button/icon-button';
import { CopyButton } from './copy-button/copy-button';
import { KeyboardHint } from './keyboard-hint/keyboard-hint';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './menu/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './popover/popover';
import { ProgressBar } from './progress/progress-bar';
import { Skeleton } from './skeleton/skeleton';
import { Tooltip } from './tooltip/tooltip';

/*
 * Small supporting components gathered on one page: menus, popovers, tooltips, keyboard
 * hints, copy, progress and loading skeletons.
 */
const meta = {
  title: 'Base/Supporting components',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const IncidentActionsMenu: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <IconButton label="More incident actions" icon={<Ellipsis />} variant="secondary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>INC-2041</DropdownMenuLabel>
        <DropdownMenuItem shortcut={<KeyboardHint keys={['N']} />}>Add a note</DropdownMenuItem>
        <DropdownMenuItem shortcut={<KeyboardHint keys={['T']} />}>Create a task</DropdownMenuItem>
        <DropdownMenuItem shortcut={<KeyboardHint keys={['H']} />}>
          Start a handoff
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger">Cancel incident</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const DataFlowPopover: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button size="small">UAE · self-hosted</Button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-body font-semibold">Data stays in UAE</p>
        <p className="mt-1 text-meta text-fg-secondary">
          Database, evidence, backups and AI model calls run inside the customer network.
        </p>
      </PopoverContent>
    </Popover>
  ),
};

export const TooltipOnFocus: Story = {
  render: () => (
    <Tooltip content="Copy incident link">
      <Button>
        <Copy aria-hidden />
        Copy link
      </Button>
    </Tooltip>
  ),
};

export const KeyboardHints: Story = {
  render: () => (
    <div className="flex flex-col gap-3 text-body">
      <span className="flex items-center gap-3">
        Command palette <KeyboardHint keys={['Ctrl', 'K']} />
      </span>
      <span className="flex items-center gap-3">
        Go to incidents <KeyboardHint keys={['G', 'I']} separator="then" />
      </span>
    </div>
  ),
};

export const CopyReference: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-body">
      <span className="font-mono" dir="ltr">
        RX-7F2A
      </span>
      <CopyButton
        value="RX-7F2A"
        label="Copy reference"
        copiedLabel="Reference copied"
        failedLabel="Copy failed"
      />
    </div>
  ),
};

export const Progress: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-2">
      <p className="text-table text-fg-secondary">Replay: 12 of 40 incidents</p>
      <ProgressBar
        label="Replay progress"
        value={12}
        max={40}
        valueText="12 of 40 incidents replayed"
      />
    </div>
  ),
};

export const LoadingSkeleton: Story = {
  render: () => (
    <div
      aria-busy="true"
      className="flex max-w-xl flex-col gap-3 rounded-panel border border-divider bg-surface-1 p-4"
    >
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
};
