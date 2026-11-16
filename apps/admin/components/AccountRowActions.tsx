'use client';

import { useActionState } from 'react';
import { AdminRole } from '@9ja-vote/shared-types';
import { changeRoleAction, setAccountStatusAction, type ActionState } from '../app/actions';

export function AccountRowActions({
  id,
  status,
  role,
  roles,
}: {
  id: string;
  status: 'ACTIVE' | 'SUSPENDED';
  role: AdminRole;
  roles: readonly AdminRole[];
}) {
  const [statusState, statusAction, statusPending] = useActionState(setAccountStatusAction, {} as ActionState);
  const [roleState, roleAction, rolePending] = useActionState(changeRoleAction, {} as ActionState);
  const next = status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

  return (
    <div style={{ display: 'grid', gap: '0.35rem' }}>
      <div className="row-actions">
        <form action={statusAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={next} />
          <button className={`mini ${next === 'SUSPENDED' ? 'danger' : ''}`} disabled={statusPending} type="submit">
            {statusPending ? '…' : next === 'SUSPENDED' ? 'Suspend' : 'Reinstate'}
          </button>
        </form>
        <form action={roleAction} className="row-actions">
          <input type="hidden" name="id" value={id} />
          <select name="role" defaultValue={role} className="mini" aria-label="Change role">
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.replaceAll('_', ' ').toLowerCase()}
              </option>
            ))}
          </select>
          <button className="mini" disabled={rolePending} type="submit">
            {rolePending ? '…' : 'Set role'}
          </button>
        </form>
      </div>
      {statusState.error || roleState.error ? <span className="muted-sm">{statusState.error ?? roleState.error}</span> : null}
      {statusState.ok || roleState.ok ? <span className="muted-sm">{statusState.ok ?? roleState.ok}</span> : null}
    </div>
  );
}
