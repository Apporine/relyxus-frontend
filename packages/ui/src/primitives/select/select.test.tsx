import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../test/render';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

function SeveritySelect({ onValueChange }: { onValueChange: (value: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Severity">
        <SelectValue placeholder="Choose severity" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="sev1">SEV1</SelectItem>
        <SelectItem value="sev2">SEV2</SelectItem>
        <SelectItem value="sev3">SEV3</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe('Select', () => {
  it('opens from the keyboard and selects an option', async () => {
    const handleValueChange = vi.fn();
    renderWithProviders(<SeveritySelect onValueChange={handleValueChange} />);

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(await screen.findByRole('option', { name: 'SEV2' }));

    expect(handleValueChange).toHaveBeenCalledWith('sev2');
    expect(screen.getByRole('combobox', { name: 'Severity' })).toHaveTextContent('SEV2');
  });
});
