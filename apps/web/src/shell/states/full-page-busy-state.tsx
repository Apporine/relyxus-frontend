'use client';

import { RelyxusWordmarkLoader } from '@relyxus/ui';

/** Client-only boot and session loading screen with the animated Relyxus wordmark. */
export function FullPageBusyState({ label }: { label?: string }) {
  return (
    <main
      id="main-content"
      aria-busy="true"
      className="flex min-h-dvh items-center justify-center bg-canvas p-6"
    >
      <RelyxusWordmarkLoader label={label} />
    </main>
  );
}
