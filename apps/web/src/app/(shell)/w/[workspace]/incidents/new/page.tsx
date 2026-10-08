import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { DeclareIncidentPage } from '@/features/incidents/declare-incident-page';

export async function generateMetadata(): Promise<Metadata> {
  const translateDeclare = await getTranslations('incidents.declare');
  return { title: translateDeclare('title') };
}

export default function DeclareIncidentRoute() {
  return <DeclareIncidentPage />;
}
