'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
} from '@relyxus/ui';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiError } from '@/lib/api/api-error';
import { newIdempotencyKey } from '@/lib/api/http-client';

import type { TrustDocument } from './model';
import { useRequestDocumentAccess } from './queries';

/** The form accepts an unticked box so it can say why; the request schema requires it ticked. */
const accessRequestFormSchema = z.object({
  fullName: z.string().trim().min(1),
  workEmail: z.email(),
  company: z.string().trim().min(1),
  hasAcceptedNda: z.boolean().refine((hasAccepted) => hasAccepted),
});
type AccessRequestForm = z.infer<typeof accessRequestFormSchema>;

/**
 * Requests an NDA-gated document. The requester accepts the NDA here; the document itself is
 * shared only after the request is approved, so nothing gated is exposed by this form.
 */
export function RequestAccessDialogContent({ document }: { document: TrustDocument }) {
  const translateAccess = useTranslations('trustCentre.requestAccess');
  const translateCommon = useTranslations('common');
  // One key per request intent, so a retried submission is never recorded twice.
  const [idempotencyKey] = useState(newIdempotencyKey);
  const requestAccess = useRequestDocumentAccess(document.id);
  const ndaCheckboxId = useId();
  const ndaErrorId = useId();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessRequestForm>({
    resolver: zodResolver(accessRequestFormSchema),
    defaultValues: { fullName: '', workEmail: '', company: '', hasAcceptedNda: false },
  });

  const submitRequest = handleSubmit((form) => {
    if (requestAccess.isPending) {
      return;
    }
    requestAccess.mutate({ request: { ...form, hasAcceptedNda: true }, idempotencyKey });
  });

  return (
    <DialogContent closeLabel={translateAccess('close')}>
      {requestAccess.isSuccess ? (
        <>
          <DialogHeader>
            <DialogTitle>{translateAccess('receivedTitle')}</DialogTitle>
            <DialogDescription>
              {translateAccess('receivedDescription', { title: document.title })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="primary">{translateAccess('done')}</Button>
            </DialogClose>
          </DialogFooter>
        </>
      ) : (
        <form noValidate onSubmit={(event) => void submitRequest(event)}>
          <DialogHeader>
            <DialogTitle>{translateAccess('title', { title: document.title })}</DialogTitle>
            <DialogDescription>{translateAccess('description')}</DialogDescription>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-4">
            <FormField
              label={translateAccess('fullName')}
              isRequired
              requiredLabel={translateCommon('required')}
              errorMessage={
                errors.fullName === undefined ? undefined : translateAccess('fullNameMissing')
              }
            >
              {(controlProps) => (
                <Input autoComplete="name" {...controlProps} {...register('fullName')} />
              )}
            </FormField>
            <FormField
              label={translateAccess('workEmail')}
              isRequired
              requiredLabel={translateCommon('required')}
              errorMessage={
                errors.workEmail === undefined ? undefined : translateAccess('workEmailInvalid')
              }
            >
              {(controlProps) => (
                <Input
                  type="email"
                  autoComplete="email"
                  {...controlProps}
                  {...register('workEmail')}
                />
              )}
            </FormField>
            <FormField
              label={translateAccess('company')}
              isRequired
              requiredLabel={translateCommon('required')}
              errorMessage={
                errors.company === undefined ? undefined : translateAccess('companyMissing')
              }
            >
              {(controlProps) => (
                <Input autoComplete="organization" {...controlProps} {...register('company')} />
              )}
            </FormField>
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-3">
                <Controller
                  control={control}
                  name="hasAcceptedNda"
                  render={({ field }) => (
                    <Checkbox
                      id={ndaCheckboxId}
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      onBlur={field.onBlur}
                      aria-invalid={errors.hasAcceptedNda === undefined ? undefined : true}
                      aria-describedby={
                        errors.hasAcceptedNda === undefined ? undefined : ndaErrorId
                      }
                      className="mt-0.5"
                    />
                  )}
                />
                <label htmlFor={ndaCheckboxId} className="text-body">
                  {translateAccess('acceptNda')}
                </label>
              </div>
              {errors.hasAcceptedNda === undefined ? null : (
                <p id={ndaErrorId} className="text-meta text-critical">
                  {translateAccess('ndaRequired')}
                </p>
              )}
            </div>
            {requestAccess.isError ? (
              <p role="alert" className="text-meta text-critical">
                {translateAccess('failed', {
                  reference:
                    requestAccess.error instanceof ApiError &&
                    requestAccess.error.correlationId !== undefined
                      ? requestAccess.error.correlationId
                      : translateCommon('notReported'),
                })}
              </p>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="tertiary">
                {translateAccess('cancel')}
              </Button>
            </DialogClose>
            <Button type="submit" variant="primary" isLoading={requestAccess.isPending}>
              {translateAccess('submit')}
            </Button>
          </DialogFooter>
        </form>
      )}
    </DialogContent>
  );
}
