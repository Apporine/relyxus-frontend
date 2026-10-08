import type { Meta, StoryObj } from '@storybook/react-vite';

import { RadioGroup, RadioGroupItem } from './radio-group';

const meta = {
  title: 'Base/Radio group',
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Density: Story = {
  render: () => (
    <RadioGroup aria-label="Density" defaultValue="comfortable">
      <div className="flex items-center gap-2 text-body">
        <RadioGroupItem id="density-comfortable" value="comfortable" />
        <label htmlFor="density-comfortable">Comfortable</label>
      </div>
      <div className="flex items-center gap-2 text-body">
        <RadioGroupItem id="density-compact" value="compact" />
        <label htmlFor="density-compact">Compact</label>
      </div>
      <div className="flex items-center gap-2 text-body">
        <RadioGroupItem id="density-locked" value="locked" disabled />
        <label htmlFor="density-locked">Locked by organisation policy</label>
      </div>
    </RadioGroup>
  ),
};
