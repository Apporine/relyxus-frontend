'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import { EChart, type ChartColors } from '@/lib/charts/echart';
import { Panel } from '@/lib/ui/panel';

import { buildCalibrationOption } from './calibration-chart-option';
import type { CalibrationBucket } from './model';

/** Calibration chart with the same figures as a table, so nothing is only visual. */
export function CalibrationPanel({ buckets }: { buckets: readonly CalibrationBucket[] }) {
  const translateCalibration = useTranslations('aiQuality.calibration');
  const buildOption = useCallback(
    (colors: ChartColors) =>
      buildCalibrationOption(buckets, colors, {
        predicted: translateCalibration('predicted'),
        actual: translateCalibration('actual'),
        perfectCalibration: translateCalibration('perfectCalibration'),
        measured: translateCalibration('measured'),
      }),
    [buckets, translateCalibration],
  );

  return (
    <Panel title={translateCalibration('title')}>
      <p className="-mt-2 text-meta text-fg-secondary">{translateCalibration('description')}</p>
      {buckets.length === 0 ? (
        <p className="text-body text-fg-secondary">{translateCalibration('empty')}</p>
      ) : (
        <>
          <EChart
            buildOption={buildOption}
            label={translateCalibration('chartLabel')}
            className="h-64"
          />
          <details className="text-table">
            <summary className="cursor-pointer font-semibold text-fg-secondary">
              {translateCalibration('showFigures')}
            </summary>
            <table className="mt-3 w-full">
              <caption className="sr-only">{translateCalibration('tableCaption')}</caption>
              <thead>
                <tr className="text-meta text-fg-tertiary uppercase">
                  <th scope="col" className="py-1 text-start font-semibold">
                    {translateCalibration('predicted')}
                  </th>
                  <th scope="col" className="py-1 text-start font-semibold">
                    {translateCalibration('actual')}
                  </th>
                  <th scope="col" className="py-1 text-start font-semibold">
                    {translateCalibration('sampleSize')}
                  </th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {buckets.map((bucket) => (
                  <tr key={bucket.predictedPercent} className="border-t border-divider">
                    <td className="py-1">
                      {translateCalibration('percent', { value: bucket.predictedPercent / 100 })}
                    </td>
                    <td className="py-1">
                      {translateCalibration('percent', { value: bucket.actualPercent / 100 })}
                    </td>
                    <td className="py-1">{bucket.sampleSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </Panel>
  );
}
