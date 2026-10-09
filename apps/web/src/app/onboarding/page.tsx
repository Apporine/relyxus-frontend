import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { OnboardingPage } from '@/features/onboarding/onboarding-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateOnboarding = await getTranslations('onboarding');
  return { title: translateOnboarding('title') };
}

export default function OnboardingRoute() {
  return <OnboardingPage />;
}
