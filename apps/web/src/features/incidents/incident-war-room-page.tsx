'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/shell/page-header';

/** Placeholder until the Incident War Room capability ships (UI/UX s. 10.4, Figma 06). */
export function IncidentWarRoomPage({ incidentReference }: { incidentReference: string }) {
  const translateWarRoom = useTranslations('incidents.warRoom');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateWarRoom('title', { reference: incidentReference })}
        description={translateWarRoom('description')}
      />
      <p className="rounded-panel border border-control bg-surface-1 px-5 py-4 text-table text-fg-secondary">
        {translateWarRoom('placeholder')}
      </p>
    </div>
  );
}
