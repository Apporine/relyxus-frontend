'use client';

import { Button, cn, Dialog, DialogTrigger } from '@relyxus/ui';
import { useTranslations } from 'next-intl';

import { trustDocumentAction, type TrustDocument, type TrustDocumentStatus } from './model';
import { RequestAccessDialogContent } from './request-access-dialog';

const statusClassNames = {
  current: 'text-healthy',
  superseded: 'text-fg-tertiary',
  expired: 'text-warning',
} satisfies Record<TrustDocumentStatus, string>;

export function TrustDocumentStatusLabel({ status }: { status: TrustDocumentStatus }) {
  const translateTrust = useTranslations('trustCentre');
  return (
    <span className={cn('font-semibold', statusClassNames[status])}>
      {translateTrust(`statuses.${status}`)}
    </span>
  );
}

/**
 * What a buyer can do with a document. Subscribing to updates arrives with the notification
 * service, so it is shown with its reason rather than as a control that does nothing.
 */
export function TrustDocumentAction({ document }: { document: TrustDocument }) {
  const translateTrust = useTranslations('trustCentre');
  const action = trustDocumentAction(document);

  if (action === 'download' && document.downloadUrl !== null) {
    return (
      <a
        href={document.downloadUrl}
        download
        className="font-semibold underline underline-offset-2"
        aria-label={translateTrust('downloadDocument', { title: document.title })}
      >
        {translateTrust('actions.download')}
      </a>
    );
  }
  if (action === 'request-access') {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="small"
            variant="secondary"
            aria-label={translateTrust('requestDocument', { title: document.title })}
          >
            {translateTrust('actions.request-access')}
          </Button>
        </DialogTrigger>
        <RequestAccessDialogContent document={document} />
      </Dialog>
    );
  }
  return (
    <span className="text-fg-secondary">
      {translateTrust(action === 'subscribe' ? 'subscribeUnavailable' : 'historyOnly')}
    </span>
  );
}
