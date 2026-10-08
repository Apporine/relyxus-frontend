'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * A choice such as the selected tab, kept in the URL so links reopen the same view
 * (UI/UX s. 7). Unknown values fall back to the default; changes replace the history entry.
 */
export function useSearchParamChoice<Choice extends string>(
  parameterName: string,
  choices: readonly Choice[],
  defaultChoice: Choice,
): [Choice, (choice: string) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedChoice = searchParams.get(parameterName);
  const currentChoice = choices.find((choice) => choice === requestedChoice) ?? defaultChoice;

  const selectChoice = useCallback(
    (choice: string) => {
      const nextParameters = new URLSearchParams(searchParams.toString());
      if (choice === defaultChoice) {
        nextParameters.delete(parameterName);
      } else {
        nextParameters.set(parameterName, choice);
      }
      const queryString = nextParameters.toString();
      router.replace(`${pathname}${queryString === '' ? '' : `?${queryString}`}` as Route, {
        scroll: false,
      });
    },
    [defaultChoice, parameterName, pathname, router, searchParams],
  );

  return [currentChoice, selectChoice];
}
