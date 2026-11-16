'use client';

import { useActionState } from 'react';
import { ADMIN_ROLES } from '@9ja-vote/shared-types';
import { createAccountAction, type ActionState } from '../app/actions';

export function CreateAccountForm() {
  const [state, formAction, pending] = useActionState(createAccountAction, {} as ActionState);
  return (
    <form action={formAction} style={{ display: 'grid', gap: '0.8rem' }}>
      <div className="form-grid">
        <label className="field">
          <span>Full name</span>
          <input name="displayName" required maxLength={80} placeholder="Ada Obi" />
        </label>
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required placeholder="ada@example.org" />
        </label>
        <label className="field">
          <span>Role</span>
          <select name="role" defaultValue="RESULTS_VERIFICATION_OFFICER">
            {ADMIN_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replaceAll('_', ' ').toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <button className="btn-sm" type="submit" disabled={pending}>
          {pending ? 'Creating…' : 'Create account'}
        </button>
      </div>
      <p className="muted-sm" style={{ margin: 0 }}>
        The API generates a one-time temporary password and returns it once. The new person should change it and enable
        MFA on first sign-in.
      </p>
      {state.error ? (
        <p className="banner error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="banner ok">
          {state.ok}
          {state.temporaryPassword ? (
            <>
              <br />
              Temporary password: <span className="mono">{state.temporaryPassword}</span>
            </>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
