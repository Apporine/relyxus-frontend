import type { ChartColors, EChartOption } from '@/lib/charts/echart';

import type { CalibrationBucket } from './model';

export type CalibrationChartLabels = {
  predicted: string;
  actual: string;
  perfectCalibration: string;
  measured: string;
};

/**
 * Predicted confidence against actual accuracy (Product s. 10): points on the diagonal mean
 * "80% confident" really is right 8 times in 10. Points below it are overconfident.
 */
export function buildCalibrationOption(
  buckets: readonly CalibrationBucket[],
  colors: ChartColors,
  labels: CalibrationChartLabels,
): EChartOption {
  const axisStyle = {
    type: 'value' as const,
    min: 0,
    max: 100,
    axisLabel: { color: colors.textTertiary, formatter: '{value}%' },
    axisLine: { lineStyle: { color: colors.strong } },
    splitLine: { lineStyle: { color: colors.divider } },
    nameTextStyle: { color: colors.textSecondary },
    nameLocation: 'middle' as const,
  };
  return {
    grid: { left: 56, right: 16, top: 16, bottom: 48 },
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.surface,
      borderColor: colors.strong,
      textStyle: { color: colors.textSecondary },
    },
    xAxis: { ...axisStyle, name: labels.predicted, nameGap: 30 },
    yAxis: { ...axisStyle, name: labels.actual, nameGap: 40 },
    series: [
      {
        name: labels.perfectCalibration,
        type: 'line',
        data: [
          [0, 0],
          [100, 100],
        ],
        symbol: 'none',
        lineStyle: { color: colors.strong, type: 'dashed', width: 1 },
        tooltip: { show: false },
      },
      {
        name: labels.measured,
        type: 'line',
        data: buckets.map((bucket) => [bucket.predictedPercent, bucket.actualPercent]),
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: colors.primarySeries, width: 2 },
        itemStyle: { color: colors.primarySeries },
      },
    ],
  };
}
