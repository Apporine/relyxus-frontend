import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { FullPageMessage } from '@/shell/states/full-page-message';

export default async function NotFoundPage() {
  const translateNotFound = await getTranslations('shell.notFound');

  return (
    <FullPageMessage
      title={translateNotFound('title')}
      description={translateNotFound('description')}
      action={
        <Link
          href="/"
          className="inline-flex h-(--rx-control-height) items-center rounded-button border border-control bg-surface-2 px-4 font-semibold text-fg-primary hover:bg-raised"
        >
          {translateNotFound('backToConsole')}
        </Link>
      }
    />
  );
}
