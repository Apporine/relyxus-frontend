import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Page titles use the template only with non-sensitive names; restricted incident titles
// must never reach document metadata.
export const metadata: Metadata = {
  title: {
    default: 'Relyxus',
    template: '%s · Relyxus',
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
