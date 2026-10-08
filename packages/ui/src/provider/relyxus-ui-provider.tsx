'use client';

import { Direction } from 'radix-ui';
import type { ReactNode } from 'react';

import { ToastProvider } from '../primitives/toast/toast';
import { TooltipProvider } from '../primitives/tooltip/tooltip';

export type TextDirection = 'ltr' | 'rtl';

export type RelyxusUiProviderProps = {
  /** Reading direction of the active locale; Radix keyboard navigation follows it. */
  direction: TextDirection;
  /** Localised accessible names for the toast region and its dismiss buttons. */
  toastLabels: {
    region: string;
    dismiss: string;
  };
  children: ReactNode;
};

/** Context every Relyxus component relies on. Mount it once near the root of each app. */
export function RelyxusUiProvider({ direction, toastLabels, children }: RelyxusUiProviderProps) {
  return (
    <Direction.Provider dir={direction}>
      <TooltipProvider delayDuration={300}>
        <ToastProvider
          regionLabel={toastLabels.region}
          dismissLabel={toastLabels.dismiss}
          swipeDirection={direction === 'rtl' ? 'left' : 'right'}
        >
          {children}
        </ToastProvider>
      </TooltipProvider>
    </Direction.Provider>
  );
}
