import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input, Textarea } from '../input/input';
import { FormField } from './form-field';

// Stories render FormField directly: its required-label props form a union that Storybook
// args cannot express.
const meta = {
  title: 'Base/Form field',
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithHelpText: Story = {
  render: () => (
    <FormField
      label="Title"
      helpText='Describe the customer-visible symptom, for example "Card authorisation failures in UK".'
    >
      {(controlProps) => <Input {...controlProps} />}
    </FormField>
  ),
};

export const Required: Story = {
  render: () => (
    <FormField
      label="Title"
      isRequired
      requiredLabel="Required"
      helpText="Shown in notifications and the status page draft."
    >
      {(controlProps) => <Input {...controlProps} />}
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField
      label="Title"
      isRequired
      requiredLabel="Required"
      errorMessage="Enter a title before declaring the incident."
    >
      {(controlProps) => <Input {...controlProps} />}
    </FormField>
  ),
};

export const ReadOnlyTechnicalValue: Story = {
  render: () => (
    <FormField label="Incident ID">
      {(controlProps) => (
        <Input {...controlProps} readOnly defaultValue="INC-2041" dir="ltr" className="font-mono" />
      )}
    </FormField>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FormField label="Business service" helpText="Managed by ServiceNow CMDB.">
      {(controlProps) => <Input {...controlProps} disabled defaultValue="Card payments" />}
    </FormField>
  ),
};

export const MultilineReason: Story = {
  render: () => (
    <FormField label="Reason for lowering severity" isRequired requiredLabel="Required">
      {(controlProps) => <Textarea {...controlProps} />}
    </FormField>
  ),
};
