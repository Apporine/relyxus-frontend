'use client';

import {
  Button,
  Checkbox,
  FormField,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  incidentVisibilities,
  severityLevels,
} from '@relyxus/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useCanChangeState } from '@/lib/live/live-updates-provider';

import type { IncidentType } from './declaration-model';
import {
  isDeclareIncidentFormValid,
  type DeclareIncidentFormState,
} from './declare-incident-form-state';
import { useDeclareIncident } from './declaration-queries';
import { incidentListBusinessServices } from './incident-list-services';

type DeclareIncidentFormProps = {
  workspaceSlug: string;
  incidentTypes: IncidentType[];
  formState: DeclareIncidentFormState;
  onFormStateChange: (patch: Partial<DeclareIncidentFormState>) => void;
  onDeclared: (reference: string) => void;
};

export function DeclareIncidentForm({
  workspaceSlug,
  incidentTypes,
  formState,
  onFormStateChange,
  onDeclared,
}: DeclareIncidentFormProps) {
  const translateDeclare = useTranslations('incidents.declare');
  const translateVisibilities = useTranslations('domain.visibilities');
  const translateCommon = useTranslations('common');
  const canChangeState = useCanChangeState();
  const declareIncident = useDeclareIncident(workspaceSlug);

  const [submitError, setSubmitError] = useState<string | undefined>();

  function handleIncidentTypeChange(incidentTypeId: string) {
    const selectedType = incidentTypes.find((type) => type.id === incidentTypeId);
    onFormStateChange({
      incidentTypeId,
      severity: selectedType?.suggestedSeverity ?? formState.severity,
    });
  }

  function toggleBusinessService(serviceId: string, isChecked: boolean) {
    onFormStateChange({
      businessServiceIds: isChecked
        ? [...formState.businessServiceIds, serviceId]
        : formState.businessServiceIds.filter((id) => id !== serviceId),
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(undefined);
    if (!isDeclareIncidentFormValid(formState)) {
      setSubmitError(translateDeclare('validationIncomplete'));
      return;
    }
    try {
      const response = await declareIncident.mutateAsync(formState);
      onDeclared(response.reference);
    } catch {
      setSubmitError(translateDeclare('submitFailed'));
    }
  }

  const isSubmitDisabled =
    !canChangeState || !isDeclareIncidentFormValid(formState) || declareIncident.isPending;

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-6 rounded-panel border border-control bg-surface-1 p-5"
      aria-labelledby="declaration-details-heading"
    >
      <h2 id="declaration-details-heading" className="text-panel-title font-semibold">
        {translateDeclare('detailsHeading')}
      </h2>

      {!canChangeState ? (
        <p className="rounded-panel border border-warning bg-surface-2 px-4 py-3 text-table text-warning">
          {translateDeclare('liveConnectionRequired')}
        </p>
      ) : null}

      <FormField
        label={translateDeclare('fields.incidentType')}
        isRequired
        requiredLabel={translateCommon('required')}
      >
        {(controlProps) => (
          <Select value={formState.incidentTypeId} onValueChange={handleIncidentTypeChange}>
            <SelectTrigger {...controlProps}>
              <SelectValue placeholder={translateDeclare('placeholders.incidentType')} />
            </SelectTrigger>
            <SelectContent>
              {incidentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>

      <FormField
        label={translateDeclare('fields.title')}
        isRequired
        requiredLabel={translateCommon('required')}
        helpText={translateDeclare('help.title')}
      >
        {(controlProps) => (
          <Input
            {...controlProps}
            value={formState.title}
            onChange={(event) => onFormStateChange({ title: event.target.value })}
            placeholder={translateDeclare('placeholders.title')}
          />
        )}
      </FormField>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-table font-semibold text-fg-primary">
          {translateDeclare('fields.affectedServices')}
        </legend>
        {incidentListBusinessServices.map((service) => (
          <label key={service.id} className="flex items-center gap-3 text-table">
            <Checkbox
              checked={formState.businessServiceIds.includes(service.id)}
              onCheckedChange={(checked) => toggleBusinessService(service.id, checked === true)}
            />
            {service.name}
          </label>
        ))}
      </fieldset>

      <FormField
        label={translateDeclare('fields.technicalComponent')}
        helpText={translateDeclare('help.technicalComponent')}
      >
        {(controlProps) => (
          <Input
            {...controlProps}
            value={formState.technicalComponent}
            onChange={(event) => onFormStateChange({ technicalComponent: event.target.value })}
            placeholder={translateDeclare('placeholders.technicalComponent')}
          />
        )}
      </FormField>

      <FormField
        label={translateDeclare('fields.severity')}
        isRequired
        requiredLabel={translateCommon('required')}
      >
        {(controlProps) => (
          <Select
            value={formState.severity}
            onValueChange={(severity) =>
              onFormStateChange({ severity: severity as DeclareIncidentFormState['severity'] })
            }
          >
            <SelectTrigger {...controlProps}>
              <SelectValue placeholder={translateDeclare('placeholders.severity')} />
            </SelectTrigger>
            <SelectContent>
              {severityLevels.map((severity) => (
                <SelectItem key={severity} value={severity}>
                  {severity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-table font-semibold text-fg-primary">
          {translateDeclare('fields.impact')}
        </legend>
        <FormField
          label={translateDeclare('fields.moneyAtRisk')}
          helpText={translateDeclare('help.moneyAtRisk')}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              inputMode="decimal"
              value={formState.moneyAmountMajor}
              onChange={(event) => onFormStateChange({ moneyAmountMajor: event.target.value })}
              placeholder={translateDeclare('placeholders.moneyAtRisk')}
            />
          )}
        </FormField>
        <FormField label={translateDeclare('fields.failedTransactions')}>
          {(controlProps) => (
            <Input
              {...controlProps}
              inputMode="numeric"
              value={formState.failedTransactions}
              onChange={(event) => onFormStateChange({ failedTransactions: event.target.value })}
              placeholder={translateDeclare('placeholders.failedTransactions')}
            />
          )}
        </FormField>
        <FormField label={translateDeclare('fields.affectedCustomers')}>
          {(controlProps) => (
            <Input
              {...controlProps}
              inputMode="numeric"
              value={formState.affectedCustomers}
              onChange={(event) => onFormStateChange({ affectedCustomers: event.target.value })}
              placeholder={translateDeclare('placeholders.affectedCustomers')}
            />
          )}
        </FormField>
      </fieldset>

      <FormField
        label={translateDeclare('fields.visibility')}
        isRequired
        requiredLabel={translateCommon('required')}
      >
        {(controlProps) => (
          <Select
            value={formState.visibility}
            onValueChange={(visibility) =>
              onFormStateChange({
                visibility: visibility as DeclareIncidentFormState['visibility'],
              })
            }
          >
            <SelectTrigger {...controlProps}>
              <SelectValue placeholder={translateDeclare('placeholders.visibility')} />
            </SelectTrigger>
            <SelectContent>
              {incidentVisibilities.map((visibility) => (
                <SelectItem key={visibility} value={visibility}>
                  {translateVisibilities(visibility)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </FormField>

      <FormField
        label={translateDeclare('fields.context')}
        helpText={translateDeclare('help.context')}
      >
        {(controlProps) => (
          <Textarea
            {...controlProps}
            value={formState.context}
            onChange={(event) => onFormStateChange({ context: event.target.value })}
            placeholder={translateDeclare('placeholders.context')}
            rows={4}
          />
        )}
      </FormField>

      {submitError === undefined ? null : (
        <p role="alert" className="text-table font-semibold text-critical">
          {submitError}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={declareIncident.isPending}
          disabled={isSubmitDisabled}
        >
          {translateDeclare('submit')}
        </Button>
      </div>
    </form>
  );
}
