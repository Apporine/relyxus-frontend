import { useId, type ReactNode } from 'react';

import { cn } from '../../lib/cn';

/** Attributes a form control needs so its label, help and error text are announced. */
export type FormFieldControlProps = {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': boolean | undefined;
  'aria-required': boolean | undefined;
};

type RequiredFieldProps =
  | {
      isRequired: true;
      /** Visible word that marks the field as required; an asterisk alone is not enough. */
      requiredLabel: string;
    }
  | {
      isRequired?: false;
      requiredLabel?: never;
    };

export type FormFieldProps = RequiredFieldProps & {
  label: string;
  /** Guidance shown below the control. Replaced by the error message while one is shown. */
  helpText?: string;
  errorMessage?: string;
  className?: string;
  children: (controlProps: FormFieldControlProps) => ReactNode;
};

/**
 * Label above, help below, error replacing help. The render function receives the
 * attributes that connect the control to that text for assistive technology.
 */
export function FormField({
  label,
  helpText,
  errorMessage,
  isRequired = false,
  requiredLabel,
  className,
  children,
}: FormFieldProps) {
  const controlId = useId();
  const descriptionId = `${controlId}-description`;
  const descriptionText = errorMessage ?? helpText;
  const hasError = errorMessage !== undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={controlId} className="flex items-baseline gap-2 text-table font-semibold">
        <span className="text-fg-primary">{label}</span>
        {isRequired ? (
          <span className="text-meta font-normal text-fg-tertiary">{requiredLabel}</span>
        ) : null}
      </label>
      {children({
        id: controlId,
        'aria-describedby': descriptionText === undefined ? undefined : descriptionId,
        'aria-invalid': hasError || undefined,
        'aria-required': isRequired || undefined,
      })}
      {descriptionText === undefined ? null : (
        <p
          id={descriptionId}
          className={cn('text-meta', hasError ? 'text-critical' : 'text-fg-tertiary')}
        >
          {descriptionText}
        </p>
      )}
    </div>
  );
}
