'use client';

import { CircleCheck, Info, OctagonAlert, TriangleAlert, X } from 'lucide-react';
import { Toast as ToastPrimitive } from 'radix-ui';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/*
 * Toasts confirm passing events (UI/UX s. 4 and 8): success and info disappear after
 * 5 seconds, warnings and errors stay until dismissed, at most three are visible, and they
 * sit at the bottom inline-end corner. A critical failure is never shown only as a toast;
 * screens pair it with a banner or inline state.
 */

const AUTO_DISMISS_MS = 5_000;
const UNDO_WINDOW_MS = 10_000;
const MAX_VISIBLE_TOASTS = 3;

export type ToastTone = 'success' | 'info' | 'warning' | 'error';

export type ToastAction = {
  label: string;
  /** Describes how to perform the action without the toast, for screen reader users. */
  alternativeText: string;
  onSelect: () => void;
};

export type ToastOptions = {
  tone: ToastTone;
  title: string;
  description?: string;
  /** For reversible level-0 changes this is Undo, offered for 10 seconds (UI/UX s. 8). */
  action?: ToastAction;
};

type VisibleToast = ToastOptions & { id: number };

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function displayDurationFor({ tone, action }: ToastOptions): number {
  if (tone === 'warning' || tone === 'error') {
    return Number.POSITIVE_INFINITY;
  }
  return action === undefined ? AUTO_DISMISS_MS : UNDO_WINDOW_MS;
}

const toneIcons = {
  success: <CircleCheck aria-hidden className="size-5 shrink-0 text-healthy" />,
  info: <Info aria-hidden className="size-5 shrink-0 text-neutral" />,
  warning: <TriangleAlert aria-hidden className="size-5 shrink-0 text-warning" />,
  error: <OctagonAlert aria-hidden className="size-5 shrink-0 text-critical" />,
} satisfies Record<ToastTone, ReactNode>;

export type ToastProviderProps = {
  children: ReactNode;
  /** Accessible name of the toast region, for example "Notifications". */
  regionLabel: string;
  /** Accessible name of each toast's dismiss button. */
  dismissLabel: string;
  swipeDirection: 'left' | 'right';
};

export function ToastProvider({
  children,
  regionLabel,
  dismissLabel,
  swipeDirection,
}: ToastProviderProps) {
  const [visibleToasts, setVisibleToasts] = useState<VisibleToast[]>([]);
  const nextToastId = useRef(0);

  const showToast = useCallback((options: ToastOptions) => {
    nextToastId.current += 1;
    const toast = { ...options, id: nextToastId.current };
    setVisibleToasts((current) => [...current, toast].slice(-MAX_VISIBLE_TOASTS));
  }, []);

  const removeToast = useCallback((toastId: number) => {
    setVisibleToasts((current) => current.filter((toast) => toast.id !== toastId));
  }, []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastPrimitive.Provider label={regionLabel} swipeDirection={swipeDirection}>
        {children}
        {visibleToasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            duration={displayDurationFor(toast)}
            type={toast.tone === 'error' || toast.tone === 'warning' ? 'foreground' : 'background'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                removeToast(toast.id);
              }
            }}
            className="flex w-full items-start gap-3 rounded-panel border border-control bg-raised p-4 text-fg-primary"
          >
            {toneIcons[toast.tone]}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <ToastPrimitive.Title className="text-body font-semibold">
                {toast.title}
              </ToastPrimitive.Title>
              {toast.description === undefined ? null : (
                <ToastPrimitive.Description className="text-meta text-fg-secondary">
                  {toast.description}
                </ToastPrimitive.Description>
              )}
              {toast.action === undefined ? null : (
                <ToastPrimitive.Action
                  altText={toast.action.alternativeText}
                  onClick={toast.action.onSelect}
                  className="mt-1 self-start rounded-button border border-control px-3 py-1 text-table font-semibold hover:bg-surface-2"
                >
                  {toast.action.label}
                </ToastPrimitive.Action>
              )}
            </div>
            <ToastPrimitive.Close
              aria-label={dismissLabel}
              className="flex size-6 shrink-0 items-center justify-center rounded-control text-fg-secondary hover:bg-surface-2 hover:text-fg-primary"
            >
              <X aria-hidden className="size-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed end-4 bottom-4 z-(--rx-layer-toast) flex w-[calc(100vw-2rem)] max-w-96 flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === null) {
    throw new Error('useToast must be used inside ToastProvider (provided by RelyxusUiProvider).');
  }
  return context;
}
