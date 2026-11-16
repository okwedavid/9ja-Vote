'use client';

import { useActionState } from 'react';
import { transitionAction, type ActionState } from '../app/actions';

export interface TransitionOption {
  value: string;
  label: string;
}

export function TransitionForm({ stateCode, options }: { stateCode: string; options: TransitionOption[] }) {
  const [state, formAction, pending] = useActionState(transitionAction, {} as ActionState);
  if (options.length === 0) {
    return <span className="muted-sm">No action available for your role</span>;
  }
  return (
    <form action={formAction} style={{ display: 'grid', gap: '0.4rem' }}>
      <input type="hidden" name="stateCode" value={stateCode} />
      <div className="row-actions">
        <select name="to" className="mini" defaultValue={options[0]!.value} aria-label={`Next status for ${stateCode}`}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input name="note" className="mini" placeholder="Note (audited)" maxLength={200} aria-label="Note for the audit trail" />
        <button className="btn-sm" type="submit" disabled={pending} style={{ minHeight: 36, fontSize: '0.82rem' }}>
          {pending ? 'Saving…' : 'Apply'}
        </button>
      </div>
      {state.error ? (
        <span className="banner error" role="alert">
          {state.error}
        </span>
      ) : null}
      {state.ok ? <span className="banner ok">{state.ok}</span> : null}
    </form>
  );
}
