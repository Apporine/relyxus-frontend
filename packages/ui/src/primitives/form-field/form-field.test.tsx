import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAccessibilityViolations } from '../../test/accessibility';
import { renderWithProviders } from '../../test/render';
import { Input, Textarea } from '../input/input';
import { FormField } from './form-field';

describe('FormField', () => {
  it('labels the control and describes it with the help text', () => {
    renderWithProviders(
      <FormField label="Title" helpText="Describe the customer-visible symptom.">
        {(controlProps) => <Input {...controlProps} />}
      </FormField>,
    );

    const input = screen.getByRole('textbox', { name: 'Title' });
    expect(input).toHaveAccessibleDescription('Describe the customer-visible symptom.');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('replaces the help text with the error and marks the control invalid', () => {
    renderWithProviders(
      <FormField
        label="Title"
        helpText="Describe the customer-visible symptom."
        errorMessage="Enter a title before declaring the incident."
      >
        {(controlProps) => <Input {...controlProps} />}
      </FormField>,
    );

    const input = screen.getByRole('textbox', { name: 'Title' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Enter a title before declaring the incident.');
    expect(screen.queryByText('Describe the customer-visible symptom.')).not.toBeInTheDocument();
  });

  it('marks a required field with visible text and aria-required', () => {
    renderWithProviders(
      <FormField label="Reason" isRequired requiredLabel="Required">
        {(controlProps) => <Textarea {...controlProps} />}
      </FormField>,
    );

    expect(screen.getByText('Required')).toBeVisible();
    expect(screen.getByRole('textbox', { name: /Reason/ })).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('has no accessibility violations with an error shown', async () => {
    const { container } = renderWithProviders(
      <FormField label="Title" isRequired requiredLabel="Required" errorMessage="Enter a title.">
        {(controlProps) => <Input {...controlProps} />}
      </FormField>,
    );
    await expectNoAccessibilityViolations(container);
  });
});
