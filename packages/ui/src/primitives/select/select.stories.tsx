import type { Meta, StoryObj } from '@storybook/react-vite';

import { FormField } from '../form-field/form-field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

const meta = {
  title: 'Base/Select',
  component: Select,
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SeverityChoice: Story = {
  render: () => (
    <FormField
      label="Suggested severity"
      helpText="Based on business impact first, then technical signals."
    >
      {(controlProps) => (
        <Select defaultValue="sev1">
          <SelectTrigger {...controlProps}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sev1">SEV1</SelectItem>
            <SelectItem value="sev2">SEV2</SelectItem>
            <SelectItem value="sev3">SEV3</SelectItem>
            <SelectItem value="sev4">SEV4</SelectItem>
          </SelectContent>
        </Select>
      )}
    </FormField>
  ),
};

export const GroupedWithPlaceholder: Story = {
  render: () => (
    <FormField label="Incident type">
      {(controlProps) => (
        <Select>
          <SelectTrigger {...controlProps}>
            <SelectValue placeholder="Choose an incident type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Operational</SelectLabel>
              <SelectItem value="production-outage">Production outage</SelectItem>
              <SelectItem value="degraded-performance">Degraded performance</SelectItem>
              <SelectItem value="payment-incident">Payment incident</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Restricted by default</SelectLabel>
              <SelectItem value="security-event">Security event</SelectItem>
              <SelectItem value="data-incident">Data incident</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </FormField>
  ),
};
