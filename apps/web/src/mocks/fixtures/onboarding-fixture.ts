import type { OnboardingProgress } from '@/features/onboarding/onboarding-page';

/* DEVELOPMENT FIXTURE. Onboarding progress after the organisation step (Figma frame 36). */
export const onboardingProgressFixture: OnboardingProgress = {
  steps: [
    { step: 'organisation', state: 'complete' },
    { step: 'connect-source', state: 'current' },
    { step: 'confirm-services', state: 'next' },
    { step: 'invite-team', state: 'optional' },
    { step: 'first-replay', state: 'next' },
  ],
  sampleWorkspaceSlug: 'payments-uk',
};
