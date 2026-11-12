import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@9ja-vote/design-system/styles.css';
import './globals.css';
import { en } from '../lib/i18n';

export const metadata: Metadata = {
  title: '9ja Vote — Your Voice. Your Future. Your Nigeria.',
  description:
    'Independent Nigerian election information and transparency demonstration platform. Not affiliated with INEC. Demonstration data only.',
};
export const viewport: Viewport = { themeColor: '#04492f', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="backdrop" aria-hidden="true" />
        <a href="#main" className="skip-link">Skip to content</a>
        <div className="demo-banner" role="note"><strong>DEMONSTRATION</strong> · {en.demoBanner}</div>
        {children}
      </body>
    </html>
  );
}
