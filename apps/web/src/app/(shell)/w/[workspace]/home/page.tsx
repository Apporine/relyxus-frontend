import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { CommandCentrePage } from '@/features/command-centre/command-centre-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateCommandCentre = await getTranslations('commandCentre');
  return { title: translateCommandCentre('title') };
}

export default function CommandCentreRoute() {
  return <CommandCentrePage />;
}
