import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@9ja-vote/design-system/styles.css';
import './globals.css';

export const metadata: Metadata = { title: '9ja Vote Live — broadcast graphics (demonstration)', robots: { index: false } };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
