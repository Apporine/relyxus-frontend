import type { ChartColors, EChartOption } from '@/lib/charts/echart';

/** MTTR per period as a line; periods are pre-formatted labels in the viewer's locale. */
export function buildMttrTrendOption(
  points: readonly { periodLabel: string; mttrMinutes: number }[],
  colors: ChartColors,
  seriesName: string,
): EChartOption {
  return {
    grid: { left: 48, right: 16, top: 16, bottom: 32 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: colors.surface,
      borderColor: colors.strong,
      textStyle: { color: colors.textSecondary },
    },
    xAxis: {
      type: 'category',
      data: points.map((point) => point.periodLabel),
      axisLabel: { color: colors.textTertiary },
      axisLine: { lineStyle: { color: colors.strong } },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: { color: colors.textTertiary, formatter: '{value}m' },
      splitLine: { lineStyle: { color: colors.divider } },
    },
    series: [
      {
        name: seriesName,
        type: 'line',
        data: points.map((point) => point.mttrMinutes),
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: colors.primarySeries, width: 2 },
        itemStyle: { color: colors.primarySeries },
      },
    ],
  };
}
