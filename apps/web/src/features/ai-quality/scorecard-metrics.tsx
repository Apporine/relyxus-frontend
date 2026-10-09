'use client';

import { MetricCard } from '@relyxus/ui';
import { useLocale, useTranslations } from 'next-intl';

import { useRelyxusFormat } from '@/lib/format/use-relyxus-format';
import { formattingLocaleFor } from '@/lib/i18n/locales';

import type { Rate, Scorecard } from './model';

const MILLISECONDS_PER_SECOND = 1_000;

/** Scorecards of Figma frame 15. Rates are withheld until enough incidents are scored. */
export function ScorecardMetrics({ scorecard }: { scorecard: Scorecard }) {
  const translateScorecard = useTranslations('aiQuality.scorecard');
  const format = useRelyxusFormat();
  const pointsFormat = new Intl.NumberFormat(formattingLocaleFor(useLocale()), {
    signDisplay: 'exceptZero',
    maximumFractionDigits: 1,
  });
  const hasEnoughData = scorecard.incidentsScored >= scorecard.minimumIncidents;
  const notEnoughData = translateScorecard('notEnoughData', {
    scored: scorecard.incidentsScored,
    minimum: scorecard.minimumIncidents,
  });

  function rateValue(rate: Rate) {
    return hasEnoughData ? translateScorecard('percent', { value: rate.percent / 100 }) : null;
  }

  function rateCaption(rate: Rate) {
    return hasEnoughData
      ? translateScorecard('change', {
          points: pointsFormat.format(rate.changePoints),
          days: scorecard.windowDays,
        })
      : undefined;
  }

  return (
    <div className="grid gap-4 tablet:grid-cols-2 laptop:grid-cols-4">
      <MetricCard
        label={translateScorecard('correctFirst')}
        value={rateValue(scorecard.correctFirst)}
        noDataLabel={notEnoughData}
        caption={rateCaption(scorecard.correctFirst)}
      />
      <MetricCard
        label={translateScorecard('topThree')}
        value={rateValue(scorecard.topThree)}
        noDataLabel={notEnoughData}
        caption={rateCaption(scorecard.topThree)}
      />
      <MetricCard
        label={translateScorecard('firstHypothesis')}
        value={
          hasEnoughData
            ? format.duration(
                scorecard.medianTimeToFirstHypothesisSeconds * MILLISECONDS_PER_SECOND,
                { includeSeconds: true },
              )
            : null
        }
        noDataLabel={notEnoughData}
        caption={translateScorecard('median')}
      />
      <MetricCard
        label={translateScorecard('misses')}
        value={String(scorecard.missCount)}
        noDataLabel={notEnoughData}
        caption={translateScorecard('lastDays', { days: scorecard.windowDays })}
      />
    </div>
  );
}
