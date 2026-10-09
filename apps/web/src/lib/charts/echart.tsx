'use client';

import {
  LineChart,
  ScatterChart,
  type LineSeriesOption,
  type ScatterSeriesOption,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  type GridComponentOption,
  type TooltipComponentOption,
} from 'echarts/components';
import { init, use as registerChartParts, type ComposeOption, type ECharts } from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { useEffect, useRef } from 'react';

import { cn } from '@relyxus/ui';

/*
 * Apache ECharts is the one chart library (technology stack). Only the chart types in use are
 * registered, and the SVG renderer keeps charts sharp at any zoom. Every chart also needs a
 * text or table alternative beside it; the chart itself is announced as one image.
 */
registerChartParts([LineChart, ScatterChart, GridComponent, TooltipComponent, SVGRenderer]);

export type EChartOption = ComposeOption<
  LineSeriesOption | ScatterSeriesOption | GridComponentOption | TooltipComponentOption
>;

/** Obsidian colours resolved from the theme, since ECharts cannot read CSS variables. */
export type ChartColors = {
  textSecondary: string;
  textTertiary: string;
  divider: string;
  strong: string;
  primarySeries: string;
  surface: string;
};

function readChartColors(element: HTMLElement): ChartColors {
  const styles = getComputedStyle(element);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    textSecondary: token('--color-fg-secondary'),
    textTertiary: token('--color-fg-tertiary'),
    divider: token('--color-divider'),
    strong: token('--color-strong'),
    primarySeries: token('--color-healthy'),
    surface: token('--color-raised'),
  };
}

type EChartProps = {
  /** Builds the option from theme colours; keep it stable (module scope or memoised). */
  buildOption: (colors: ChartColors) => EChartOption;
  /** Accessible name describing what the chart shows. */
  label: string;
  className?: string;
};

export function EChart({ buildOption, label, className }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }
    const chart = init(container, null, { renderer: 'svg' });
    chartRef.current = chart;
    const resizeObserver = new ResizeObserver(() => chart.resize());
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null || chartRef.current === null) {
      return;
    }
    chartRef.current.setOption(
      { animation: false, ...buildOption(readChartColors(container)) },
      { notMerge: true },
    );
  }, [buildOption]);

  return (
    <div ref={containerRef} role="img" aria-label={label} className={cn('w-full', className)} />
  );
}
