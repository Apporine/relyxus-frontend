import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';

import { RelyxusUiProvider, type TextDirection } from '../src/provider/relyxus-ui-provider';
import './storybook.css';

function StoryProviders({
  direction,
  children,
}: {
  direction: TextDirection;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = direction === 'rtl' ? 'ar' : 'en';
  }, [direction]);

  return (
    <RelyxusUiProvider
      direction={direction}
      toastLabels={{ region: 'Notifications', dismiss: 'Dismiss notification' }}
    >
      <div className="min-h-dvh bg-canvas p-6">{children}</div>
    </RelyxusUiProvider>
  );
}

const withRelyxusProviders: Decorator = (Story, context) => (
  <StoryProviders direction={context.globals.direction === 'rtl' ? 'rtl' : 'ltr'}>
    <Story />
  </StoryProviders>
);

const preview: Preview = {
  globalTypes: {
    direction: {
      description: 'Reading direction of the active locale',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'English (left to right)' },
          { value: 'rtl', title: 'Arabic (right to left)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    direction: 'ltr',
  },
  decorators: [withRelyxusProviders],
  parameters: {
    layout: 'fullscreen',
    a11y: { test: 'error' },
  },
};

export default preview;
