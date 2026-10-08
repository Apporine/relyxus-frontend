import type { Meta, StoryObj } from '@storybook/react-vite';

import { RelyxusWordmarkLoader } from './relyxus-wordmark-loader';

const meta = {
  title: 'Relyxus/Wordmark loader',
  component: RelyxusWordmarkLoader,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RelyxusWordmarkLoader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex min-h-dvh items-center justify-center bg-canvas p-6">
      <RelyxusWordmarkLoader label="Loading workspace" />
    </div>
  ),
};
