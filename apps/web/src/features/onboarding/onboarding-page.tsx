'use client';

import { cn, Skeleton } from '@relyxus/ui';
import { useQuery } from '@tanstack/react-query';
import type { Route } from 'next';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { requestApi } from '@/lib/api/http-client';
import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailLayout } from '@/lib/ui/list-detail-layout';
import { PageLoadFailedState } from '@/lib/ui/page-states';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { PageHeader } from '@/shell/page-header';

/*
 * Onboarding (UI/UX s. 14; Product s. 15): five resumable steps to the first real Replay.
 * Provisional contract (ADR 0004).
 */
export const onboardingSteps = [
  'organisation',
  'connect-source',
  'confirm-services',
  'invite-team',
  'first-replay',
] as const;
export const onboardingStepStates = ['complete', 'current', 'next', 'optional'] as const;
type OnboardingStepState = (typeof onboardingStepStates)[number];

export const onboardingProgressSchema = z.object({
  steps: z.array(z.object({ step: z.enum(onboardingSteps), state: z.enum(onboardingStepStates) })),
  /** The labelled sample workspace people can explore at any time. */
  sampleWorkspaceSlug: z.string().min(1),
});
export type OnboardingProgress = z.infer<typeof onboardingProgressSchema>;

const stepStateClassNames = {
  complete: 'text-healthy',
  current: 'text-fg-primary',
  next: 'text-fg-tertiary',
  optional: 'text-fg-tertiary',
} satisfies Record<OnboardingStepState, string>;

function useOnboardingProgress() {
  return useQuery({
    queryKey: ['onboarding', 'progress'],
    queryFn: async ({ signal }) =>
      (
        await requestApi({
          path: '/onboarding',
          responseSchema: onboardingProgressSchema,
          signal,
        })
      ).data,
  });
}

function SetupProgress({ progress }: { progress: OnboardingProgress }) {
  const translateOnboarding = useTranslations('onboarding');
  return (
    <Panel title={translateOnboarding('progress')}>
      <ol className="flex flex-col gap-2">
        {progress.steps.map(({ step, state }, index) => (
          <li
            key={step}
            aria-current={state === 'current' ? 'step' : undefined}
            className={cn(
              'flex flex-col gap-1 rounded-panel border p-3',
              state === 'current' ? 'border-strong bg-selected' : 'border-divider',
            )}
          >
            <span className="text-body font-semibold">
              {translateOnboarding('stepTitle', {
                number: index + 1,
                name: translateOnboarding(`steps.${step}`),
              })}
            </span>
            <span className={cn('text-meta font-semibold', stepStateClassNames[state])}>
              {translateOnboarding(`states.${state}`)}
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

/** Onboarding (UI/UX s. 14, Figma frame 36). */
export function OnboardingPage() {
  const translateOnboarding = useTranslations('onboarding');
  const progressQuery = useOnboardingProgress();

  return (
    <main className="mx-auto flex min-h-dvh max-w-[90rem] flex-col gap-6 bg-canvas p-6 tablet:p-10">
      <PageHeader
        title={translateOnboarding('title')}
        description={translateOnboarding('description')}
        actions={
          <UnavailableAction
            label={translateOnboarding('connectPrometheus')}
            reason={translateOnboarding('connectPrometheusUnavailable')}
          />
        }
      />
      {progressQuery.isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : progressQuery.isError ? (
        <PageLoadFailedState
          error={progressQuery.error}
          sectionName={translateOnboarding('title')}
          onRetry={() => void progressQuery.refetch()}
        />
      ) : (
        <ListDetailLayout
          list={<SetupProgress progress={progressQuery.data} />}
          detail={
            <Panel title={translateOnboarding('currentStep')}>
              <BoxedFacts
                facts={[
                  {
                    label: translateOnboarding('recommended'),
                    value: translateOnboarding('recommendedValue'),
                  },
                  { label: translateOnboarding('mode'), value: translateOnboarding('modeValue') },
                  {
                    label: translateOnboarding('requirement'),
                    value: translateOnboarding('requirementValue'),
                  },
                  { label: translateOnboarding('next'), value: translateOnboarding('nextValue') },
                  {
                    label: translateOnboarding('sampleWorkspace'),
                    value: (
                      <Link
                        href={
                          `/w/${encodeURIComponent(progressQuery.data.sampleWorkspaceSlug)}/home` as Route
                        }
                        className="font-semibold underline underline-offset-2"
                      >
                        {translateOnboarding('openSampleWorkspace')}
                      </Link>
                    ),
                  },
                ]}
              />
            </Panel>
          }
          aside={
            <Panel title={translateOnboarding('whyTitle')}>
              <StackedFacts
                facts={[
                  {
                    label: translateOnboarding('firstValue'),
                    value: translateOnboarding('firstValueText'),
                  },
                  {
                    label: translateOnboarding('readOnly'),
                    value: translateOnboarding('readOnlyText'),
                  },
                  {
                    label: translateOnboarding('resume'),
                    value: translateOnboarding('resumeText'),
                  },
                  {
                    label: translateOnboarding('sampleData'),
                    value: translateOnboarding('sampleDataText'),
                  },
                ]}
              />
            </Panel>
          }
        />
      )}
    </main>
  );
}
