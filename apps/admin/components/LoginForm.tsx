'use client';

import { useActionState } from 'react';
import { loginAction, type ActionState } from '../app/actions';

const initial: ActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  return (
    <form action={formAction} className="stack" style={{ display: 'grid', gap: '0.9rem' }}>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" autoComplete="username" required placeholder="you@example.org" />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" autoComplete="current-password" required minLength={8} />
      </label>
      <label className="field">
        <span>Authenticator code (only if you enabled MFA)</span>
        <input name="totp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="123456" />
      </label>
      {state.error ? (
        <p className="banner error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className="btn-sm" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="muted-sm">
        Accounts are created by a super administrator or by the seed script. There are no default credentials in this
        repository.
      </p>
    </form>
  );
}
