import Link from 'next/link';
import type { ReactNode } from 'react';
import { Account } from '@9ja-vote/shared-types';
import { logoutAction } from '../app/actions';
import { Emblem } from './Emblem';

const NAV: Array<{ href: string; label: string; note?: string }> = [
  { href: '/', label: 'Overview' },
  { href: '/results', label: 'Results verification' },
  { href: '/audit', label: 'Audit log' },
  { href: '/accounts', label: 'Administrators' },
  { href: '/elections', label: 'Elections & calendar' },
  { href: '/platform', label: 'Platform status' },
  { href: '/settings', label: 'Security settings' },
];

export function Shell({ account, current, children }: { account: Account; current: string; children: ReactNode }) {
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <Emblem size={34} />
          <span>Command Centre</span>
        </div>
        <nav aria-label="Sections">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={current === item.href ? 'page' : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="who">
          <strong>{account.displayName}</strong>
          {account.email}
          <div style={{ marginTop: '0.4rem' }}>
            <span className="tag">{account.role.replaceAll('_', ' ')}</span>{' '}
            <span className="tag">{account.mfaEnabled ? 'MFA on' : 'MFA off'}</span>
          </div>
          <form action={logoutAction}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
