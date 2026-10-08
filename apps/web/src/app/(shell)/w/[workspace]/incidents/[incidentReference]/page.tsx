import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { IncidentWarRoomPage } from '@/features/incidents/incident-war-room-page';

type IncidentWarRoomRouteProps = {
  params: Promise<{ incidentReference: string }>;
};

export async function generateMetadata({ params }: IncidentWarRoomRouteProps): Promise<Metadata> {
  const { incidentReference } = await params;
  const translateWarRoom = await getTranslations('incidents.warRoom');
  return { title: translateWarRoom('title', { reference: incidentReference }) };
}

export default async function IncidentWarRoomRoute({ params }: IncidentWarRoomRouteProps) {
  const { incidentReference } = await params;
  return <IncidentWarRoomPage incidentReference={incidentReference} />;
}
