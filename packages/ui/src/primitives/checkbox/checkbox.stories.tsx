import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from './checkbox';

const meta = {
  title: 'Base/Checkbox',
  component: Checkbox,
  args: {
    'aria-label': 'Select INC-2041',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: { defaultChecked: true },
};

export const Mixed: Story = {
  args: { checked: 'indeterminate', 'aria-label': 'Select all incidents' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithVisibleLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-body">
      <Checkbox id="notify-communications-lead" />
      <label htmlFor="notify-communications-lead">Notify the communications lead</label>
    </div>
  ),
};
