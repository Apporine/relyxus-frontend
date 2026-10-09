'use client';

import { useLocale, useTranslations } from 'next-intl';

import { formattingLocaleFor } from '@/lib/i18n/locales';
import { BoxedFacts, StackedFacts } from '@/lib/ui/fact-list';
import { ListDetailContent } from '@/lib/ui/list-detail-content';
import { SelectableListPanel } from '@/lib/ui/list-detail-layout';
import { Panel } from '@/lib/ui/panel';
import { UnavailableAction } from '@/lib/ui/unavailable-action';
import { useUrlSelection } from '@/lib/ui/use-url-selection';
import { PageHeader } from '@/shell/page-header';
import { useCurrentWorkspace } from '@/shell/workspace/current-workspace';

import type { IncidentTypeDetail } from './model';
import { incidentTypeQueries } from './queries';

function useListFormat() {
  const listFormat = new Intl.ListFormat(formattingLocaleFor(useLocale()), {
    type: 'conjunction',
  });
  return (items: readonly string[]) => listFormat.format(items);
}

function IncidentTypeDetailPanel({ incidentType }: { incidentType: IncidentTypeDetail }) {
  const translateTypes = useTranslations('incidentTypes');
  const translateStates = useTranslations('domain.incidentStates');
  const translateVisibilities = useTranslations('domain.visibilities');
  const formatList = useListFormat();
  return (
    <Panel title={incidentType.name}>
      <BoxedFacts
        facts={[
          {
            label: translateTypes('facts.declarationForm'),
            value: formatList(incidentType.declarationFields),
          },
          {
            label: translateTypes('facts.visibilityDefault'),
            value: translateVisibilities(incidentType.defaultVisibility),
          },
          {
            label: translateTypes('facts.lifecycle'),
            value: incidentType.lifecycle
              .map((state) => translateStates(state))
              .join(` ${translateTypes('lifecycleArrow')} `),
          },
          {
            label: translateTypes('facts.automations'),
            value:
              incidentType.automations.length === 0
                ? translateTypes('none')
                : formatList(incidentType.automations),
          },
          {
            label: translateTypes('facts.regulatorMappings'),
            value:
              incidentType.regulatorMappings.length === 0
                ? translateTypes('none')
                : formatList(incidentType.regulatorMappings),
          },
          {
            label: translateTypes('facts.versionBehaviour'),
            value: translateTypes('versionBehaviour'),
          },
        ]}
      />
    </Panel>
  );
}

/** Live preview: what a responder sees when declaring this type (UI/UX s. 13.3). */
function ResponderPreview({ incidentType }: { incidentType: IncidentTypeDetail }) {
  const translateTypes = useTranslations('incidentTypes');
  const formatList = useListFormat();
  return (
    <Panel title={translateTypes('preview.title')}>
      <StackedFacts
        facts={[
          { label: translateTypes('preview.responderView'), value: incidentType.name },
          {
            label: translateTypes('preview.requiredFields'),
            value: formatList(incidentType.requiredFields),
          },
          ...incidentType.conditionalFields.map((conditional) => ({
            label: translateTypes('preview.conditionalField'),
            value: translateTypes('preview.condition', conditional),
          })),
        ]}
      />
    </Panel>
  );
}

/** Incident types, fields and forms (UI/UX s. 13.3, Figma frame 27). */
export function IncidentTypesPage() {
  const translateTypes = useTranslations('incidentTypes');
  const { workspace } = useCurrentWorkspace();
  const listQuery = incidentTypeQueries.useList(workspace.slug);
  const { selectedId, hrefFor } = useUrlSelection(
    'type',
    listQuery.data?.map((incidentType) => incidentType.id),
  );
  const detailQuery = incidentTypeQueries.useDetail(workspace.slug, selectedId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translateTypes('title')}
        description={translateTypes('description')}
        actions={
          <UnavailableAction
            label={translateTypes('newType')}
            reason={translateTypes('newTypeUnavailable')}
          />
        }
      />
      <ListDetailContent
        listQuery={listQuery}
        detailQuery={detailQuery}
        selectedId={selectedId}
        sectionName={translateTypes('title')}
        detailSectionName={translateTypes('detailSectionName')}
        renderList={(incidentTypes) => (
          <SelectableListPanel
            title={translateTypes('listTitle')}
            emptyText={translateTypes('empty')}
            selectedId={selectedId}
            hrefFor={hrefFor}
            items={incidentTypes.map((incidentType) => ({
              id: incidentType.id,
              title: incidentType.name,
              meta: translateTypes('listMeta', {
                version: incidentType.version,
                state: translateTypes(`states.${incidentType.state}`),
              }),
            }))}
          />
        )}
        renderDetail={(incidentType) => <IncidentTypeDetailPanel incidentType={incidentType} />}
        renderAside={(incidentType) => <ResponderPreview incidentType={incidentType} />}
      />
    </div>
  );
}
