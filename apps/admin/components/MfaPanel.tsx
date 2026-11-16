'use client';

import { useActionState } from 'react';
import { changePasswordAction, enableMfaAction, setupMfaAction, type ActionState } from '../app/actions';

export function MfaPanel({ enabled }: { enabled: boolean }) {
  const [setupState, setupAction, setupPending] = useActionState(setupMfaAction, {} as ActionState);
  const [enableState, enableAction, enablePending] = useActionState(enableMfaAction, {} as ActionState);

  if (enabled) {
    return <p className="banner ok">Two-factor authentication is enabled for this account.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '0.8rem' }}>
      <form action={setupAction}>
        <button className="btn-sm" type="submit" disabled={setupPending}>
          {setupPending ? 'Generating…' : setupState.secret ? 'Generate a new secret' : 'Start two-factor setup'}
        </button>
      </form>
      {setupState.error ? <p className="banner error">{setupState.error}</p> : null}
      {setupState.secret ? (
        <div className="banner info">
          <p style={{ marginTop: 0 }}>
            Add this secret to an authenticator app (Google Authenticator, Aegis, 1Password). Nothing is stored until you
            confirm a code.
          </p>
          <p className="mono" style={{ margin: '0.4rem 0' }}>
            {setupState.secret}
          </p>
          <p className="mono" style={{ margin: 0 }}>
            {setupState.otpauthUrl}
          </p>
        </div>
      ) : null}
      <form action={enableAction} className="row-actions">
        <input name="code" className="mini" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="123456" aria-label="6-digit code" required />
        <button className="btn-sm" type="submit" disabled={enablePending} style={{ minHeight: 36 }}>
          {enablePending ? 'Checking…' : 'Confirm and enable'}
        </button>
      </form>
      {enableState.error ? <p className="banner error">{enableState.error}</p> : null}
      {enableState.ok ? <p className="banner ok">{enableState.ok}</p> : null}
    </div>
  );
}

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, {} as ActionState);
  return (
    <form action={formAction} style={{ display: 'grid', gap: '0.8rem' }}>
      <div className="form-grid">
        <label className="field">
          <span>Current password</span>
          <input name="currentPassword" type="password" autoComplete="current-password" required />
        </label>
        <label className="field">
          <span>New password (12+ characters)</span>
          <input name="newPassword" type="password" autoComplete="new-password" minLength={12} required />
        </label>
        <button className="btn-sm" type="submit" disabled={pending}>
          {pending ? 'Changing…' : 'Change password'}
        </button>
      </div>
      {state.error ? <p className="banner error">{state.error}</p> : null}
      {state.ok ? <p className="banner ok">{state.ok}</p> : null}
    </form>
  );
}
