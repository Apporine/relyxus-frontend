import { describe, expect, it } from 'vitest';

import type { ChartColors } from '@/lib/charts/echart';

import { buildCalibrationOption } from './calibration-chart-option';

const colors: ChartColors = {
  textSecondary: '#d0d0cb',
  textTertiary: '#a6a6a0',
  divider: '#29292e',
  strong: '#66666f',
  primarySeries: '#50cfa1',
  surface: '#131315',
};

const labels = {
  predicted: 'Predicted confidence',
  actual: 'Actual accuracy',
  perfectCalibration: 'Perfect calibration',
  measured: 'Measured',
};

describe('buildCalibrationOption', () => {
  const option = buildCalibrationOption(
    [
      { predictedPercent: 35, actualPercent: 31, sampleSize: 40 },
      { predictedPercent: 75, actualPercent: 70, sampleSize: 81 },
    ],
    colors,
    labels,
  );
  const series = Array.isArray(option.series) ? option.series : [];

  it('draws perfect calibration as a dashed diagonal from 0 to 100 percent', () => {
    expect(series[0]).toMatchObject({
      name: 'Perfect calibration',
      data: [
        [0, 0],
        [100, 100],
      ],
      lineStyle: { type: 'dashed', color: colors.strong },
    });
  });

  it('plots each confidence band as predicted against actual', () => {
    expect(series[1]).toMatchObject({
      name: 'Measured',
      data: [
        [35, 31],
        [75, 70],
      ],
      itemStyle: { color: colors.primarySeries },
    });
  });

  it('labels both axes and fixes them to the percentage range', () => {
    expect(option.xAxis).toMatchObject({ name: 'Predicted confidence', min: 0, max: 100 });
    expect(option.yAxis).toMatchObject({ name: 'Actual accuracy', min: 0, max: 100 });
  });
});
