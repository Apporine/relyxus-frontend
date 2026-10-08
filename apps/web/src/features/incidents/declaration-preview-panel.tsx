'use client';

import { useTranslations } from 'next-intl';

import type { DeclareIncidentFormState } from './declare-incident-form-state';
import { incidentListBusinessServices } from './incident-list-services';

export function DeclarationPreviewPanel({ formState }: { formState: DeclareIncidentFormState }) {
  const translatePreview = useTranslations('incidents.declare.preview');

  const selectedServices = incidentListBusinessServices
    .filter((service) => formState.businessServiceIds.includes(service.id))
    .map((service) => service.name);

  return (
    <aside
      aria-labelledby="declaration-preview-heading"
      className="flex flex-col gap-5 rounded-panel border border-control bg-surface-1 p-5"
    >
      <h2 id="declaration-preview-heading" className="text-panel-title font-semibold">
        {translatePreview('heading')}
      </h2>

      <section className="flex flex-col gap-1">
        <h3 className="text-meta font-semibold text-fg-secondary uppercase">
          {translatePreview('onDeclare')}
        </h3>
        <p className="text-table text-fg-primary">{translatePreview('warRoomOpens')}</p>
      </section>

      <section className="flex flex-col gap-1">
        <h3 className="text-meta font-semibold text-fg-secondary uppercase">
          {translatePreview('notifications')}
        </h3>
        <p className="text-table text-fg-primary">{translatePreview('notifyOnCall')}</p>
      </section>

      <section className="flex flex-col gap-1">
        <h3 className="text-meta font-semibold text-fg-secondary uppercase">
          {translatePreview('productionChanges')}
        </h3>
        <p className="text-table font-semibold text-healthy">
          {translatePreview('productionChangesBlocked')}
        </p>
      </section>

      {selectedServices.length === 0 ? null : (
        <section className="flex flex-col gap-1 border-t border-divider pt-4">
          <h3 className="text-meta font-semibold text-fg-secondary uppercase">
            {translatePreview('affectedServices')}
          </h3>
          <p className="text-table text-fg-primary">
            {selectedServices.join(' • ')}
            {formState.technicalComponent.trim() === ''
              ? null
              : ` • ${formState.technicalComponent.trim()}`}
          </p>
        </section>
      )}
    </aside>
  );
}
