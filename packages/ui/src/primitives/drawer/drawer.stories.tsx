import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../button/button';
import { CodeBlock } from '../code-block/code-block';
import { Drawer, DrawerContent, DrawerTrigger } from './drawer';

const meta = {
  title: 'Base/Drawer',
  component: Drawer,
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EvidenceDetail: Story = {
  render: () => (
    <Drawer defaultOpen>
      <DrawerTrigger asChild>
        <Button>Open evidence</Button>
      </DrawerTrigger>
      <DrawerContent
        title="Prometheus · payments error rate"
        description="Captured 12:04:31 UTC · fresh · hash verified"
        closeLabel="Close drawer"
      >
        <CodeBlock code={'rate(http_requests_total{status=~"5.."}[5m])'} label="PromQL query" />
      </DrawerContent>
    </Drawer>
  ),
};

export const Widths: Story = {
  render: () => (
    <div className="flex gap-3">
      {(['narrow', 'standard', 'wide'] as const).map((width) => (
        <Drawer key={width}>
          <DrawerTrigger asChild>
            <Button>Open {width} drawer</Button>
          </DrawerTrigger>
          <DrawerContent title={`${width} drawer`} closeLabel="Close drawer" width={width}>
            Drawer content
          </DrawerContent>
        </Drawer>
      ))}
    </div>
  ),
};
