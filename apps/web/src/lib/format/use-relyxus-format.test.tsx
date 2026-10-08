import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithIntl } from '@/test/render-with-intl';

import { useTimeDisplay } from './time-display';
import { useRelyxusFormat } from './use-relyxus-format';

const MINUTE_MS = 60_000;

function FormattedSample() {
  const format = useRelyxusFormat();
  const { toggleUtc } = useTimeDisplay();
  return (
    <div>
      <p data-testid="duration-hours">{format.duration(171 * MINUTE_MS)}</p>
      <p data-testid="duration-minutes">{format.duration(14 * MINUTE_MS)}</p>
      <p data-testid="duration-seconds">{format.duration(40_000)}</p>
      <p data-testid="time">{format.timeOfDay(new Date('2026-10-07T12:03:00Z'))}</p>
      <p data-testid="deadline">
        {format.deadline(171 * MINUTE_MS, new Date('2026-10-07T15:00:00Z'))}
      </p>
      <button type="button" onClick={toggleUtc}>
        Toggle UTC
      </button>
    </div>
  );
}

describe('useRelyxusFormat', () => {
  it('formats durations and deadlines with the English catalogue', () => {
    renderWithIntl(<FormattedSample />);

    expect(screen.getByTestId('duration-hours')).toHaveTextContent('2h 51m');
    expect(screen.getByTestId('duration-minutes')).toHaveTextContent('14m');
    expect(screen.getByTestId('duration-seconds')).toHaveTextContent('40s');
    expect(screen.getByTestId('deadline')).toHaveTextContent('2h 51m left · due 15:00 UTC');
  });

  it('switches every time on the page to UTC and back', async () => {
    renderWithIntl(<FormattedSample />, { timeZone: 'Asia/Dubai' });
    expect(screen.getByTestId('time')).toHaveTextContent('16:03');

    await userEvent.click(screen.getByRole('button', { name: 'Toggle UTC' }));
    expect(screen.getByTestId('time')).toHaveTextContent('12:03 UTC');

    await userEvent.click(screen.getByRole('button', { name: 'Toggle UTC' }));
    expect(screen.getByTestId('time')).toHaveTextContent('16:03');
  });

  it('uses the Arabic catalogue with Western digits', () => {
    renderWithIntl(<FormattedSample />, { locale: 'ar' });
    expect(screen.getByTestId('duration-hours')).toHaveTextContent('2 س 51 د');
  });
});
