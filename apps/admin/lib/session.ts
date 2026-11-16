import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Account, Permission, ROLE_PERMISSIONS } from '@9ja-vote/shared-types';
import { apiFetch } from './api';

export const SESSION_COOKIE = '9ja_session';

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function getSession(): Promise<Account | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    return await apiFetch<Account>('/auth/me', {}, token);
  } catch {
    return null;
  }
}

/** Every Command Centre page calls this; unauthenticated visitors are sent to the sign-in page. */
export async function requireSession(): Promise<{ account: Account; token: string }> {
  const token = await getToken();
  const account = token ? await getSession() : null;
  if (!token || !account) redirect('/login');
  return { account, token };
}

export function can(account: Account, permission: Permission): boolean {
  return ROLE_PERMISSIONS[account.role].includes(permission);
}
