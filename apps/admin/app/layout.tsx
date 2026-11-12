import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@9ja-vote/design-system/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: '9ja Vote Command Centre (demonstration)',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="demo-banner" role="note">
          <strong>DEMONSTRATION</strong> · Command Centre scaffold. Sign-in is not implemented yet and no administrator accounts exist.
        </div>
        {children}
      </body>
    </html>
  );
}
