import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { WarRoomPage } from '@/features/war-room/war-room-page';

type IncidentWarRoomRouteProps = {
  params: Promise<{ incidentReference: string }>;
};

export async function generateMetadata({ params }: IncidentWarRoomRouteProps): Promise<Metadata> {
  const { incidentReference } = await params;
  // Only the reference already in the URL; never the title, which may be restricted.
  const translateWarRoom = await getTranslations('warRoom');
  return { title: translateWarRoom('documentTitle', { reference: incidentReference }) };
}

export default async function IncidentWarRoomRoute({ params }: IncidentWarRoomRouteProps) {
  const { incidentReference } = await params;
  return <WarRoomPage incidentReference={decodeURIComponent(incidentReference)} />;
}
