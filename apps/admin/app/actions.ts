'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Account, LoginResult } from '@9ja-vote/shared-types';
import { apiFetch } from '../lib/api';
import { getToken, SESSION_COOKIE } from '../lib/session';

export interface ActionState {
  error?: string;
  ok?: string;
  secret?: string;
  otpauthUrl?: string;
  temporaryPassword?: string;
}

function message(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export async function logoutAction(): Promise<void> {
  const token = await getToken();
  if (token) {
    await apiFetch('/auth/logout', { method: 'POST' }, token).catch(() => undefined);
  }
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}

export async function transitionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: 'Your session expired. Sign in again.' };
  const stateCode = String(formData.get('stateCode') ?? '');
  const to = String(formData.get('to') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  if (!stateCode || !to) return { error: 'Choose a next status first.' };
  try {
    await apiFetch(
      `/results/states/${stateCode}/transition`,
      { method: 'POST', body: JSON.stringify({ to, ...(note ? { note } : {}) }) },
      token,
    );
    revalidatePath('/results');
    revalidatePath('/');
    return { ok: `${stateCode} moved to ${to.replaceAll('_', ' ').toLowerCase()}.` };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function createAccountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: 'Your session expired. Sign in again.' };
  const email = String(formData.get('email') ?? '').trim();
  const displayName = String(formData.get('displayName') ?? '').trim();
  const role = String(formData.get('role') ?? '');
  if (!email || !displayName || !role) return { error: 'Fill in name, email and role.' };
  try {
    const result = await apiFetch<{ account: Account; temporaryPassword?: string }>(
      '/admin/accounts',
      { method: 'POST', body: JSON.stringify({ email, displayName, role }) },
      token,
    );
    revalidatePath('/accounts');
    return {
      ok: `${result.account.email} created as ${result.account.role}.`,
      temporaryPassword: result.temporaryPassword,
    };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function setAccountStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: 'Your session expired. Sign in again.' };
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  try {
    await apiFetch(`/admin/accounts/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
    revalidatePath('/accounts');
    return { ok: `Account set to ${status.toLowerCase()}.` };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function changeRoleAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: 'Your session expired. Sign in again.' };
  const id = String(formData.get('id') ?? '');
  const role = String(formData.get('role') ?? '');
  try {
    await apiFetch(`/admin/accounts/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }, token);
    revalidatePath('/accounts');
    return { ok: `Role changed to ${role}.` };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function setupMfaAction(_prev: ActionState): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: 'Your session expired. Sign in again.' };
  try {
    const result = await apiFetch<{ secret: string; otpauthUrl: string }>('/auth/mfa/setup', { method: 'POST' }, token);
    return { secret: result.secret, otpauthUrl: result.otpauthUrl, ok: 'Scan the code, then confirm a generated code.' };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function enableMfaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: 'Your session expired. Sign in again.' };
  const code = String(formData.get('code') ?? '').trim();
  try {
    await apiFetch('/auth/mfa/enable', { method: 'POST', body: JSON.stringify({ code }) }, token);
    revalidatePath('/settings');
    return { ok: 'Two-factor authentication is now enabled for your account.' };
  } catch (error) {
    return { error: message(error) };
  }
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = await getToken();
  if (!token) return { error: 'Your session expired. Sign in again.' };
  const currentPassword = String(formData.get('currentPassword') ?? '');
  const newPassword = String(formData.get('newPassword') ?? '');
  try {
    await apiFetch('/auth/password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }, token);
    return { ok: 'Password changed. Other devices stay signed in until their token expires.' };
  } catch (error) {
    return { error: message(error) };
  }
}
