'use client';

import { Banner, Button, buttonVariants, cn } from '@relyxus/ui';
import type { Route } from 'next';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useId } from 'react';

import { isApiMockingEnabled } from '@/mocks/is-api-mocking-enabled';

import { safeReturnPath, signInUrlFor } from './return-path';

const DEMO_WORKSPACE_HOME = '/w/payments-uk/home';

/**
 * Sign-in (Product s. 14 and 17). Relyxus never asks for a password: people sign in with their
 * organisation's identity provider, which also enforces its own multi-factor policy. The
 * provider entry point is configured per environment (open question Q5).
 */
export function SignInPage() {
  const translateSignIn = useTranslations('signIn');
  const searchParams = useSearchParams();
  const returnPath = safeReturnPath(searchParams.get('returnTo'));
  const hasSessionExpired = searchParams.get('reason') === 'session-expired';
  const signInUrl = signInUrlFor(returnPath);
  const unavailableNoteId = useId();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-panel border border-control bg-surface-1 p-8">
        <p className="text-panel-title font-semibold">Relyxus</p>
        <div className="flex flex-col gap-2">
          <h1 className="text-page-title font-semibold">{translateSignIn('title')}</h1>
          <p className="text-body text-fg-secondary">{translateSignIn('description')}</p>
        </div>
        {hasSessionExpired ? (
          <Banner
            tone="info"
            title={translateSignIn('sessionExpiredTitle')}
            description={translateSignIn('sessionExpiredDescription')}
          />
        ) : null}
        {signInUrl === null ? (
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="large" disabled aria-describedby={unavailableNoteId}>
              {translateSignIn('continue')}
            </Button>
            <p id={unavailableNoteId} className="text-meta text-fg-tertiary">
              {translateSignIn('notConfigured')}
            </p>
          </div>
        ) : (
          <a
            href={signInUrl}
            className={cn(buttonVariants({ variant: 'primary', size: 'large' }), 'w-full')}
          >
            {translateSignIn('continue')}
          </a>
        )}
        {returnPath === '/' ? null : (
          <p className="text-meta text-fg-secondary">
            {translateSignIn('returnTo')}{' '}
            <span dir="ltr" className="font-mono">
              {returnPath}
            </span>
          </p>
        )}
        {isApiMockingEnabled() ? (
          <Link
            href={DEMO_WORKSPACE_HOME as Route}
            className="text-table font-semibold underline underline-offset-2"
          >
            {translateSignIn('openDemo')}
          </Link>
        ) : null}
      </div>
    </main>
  );
}
