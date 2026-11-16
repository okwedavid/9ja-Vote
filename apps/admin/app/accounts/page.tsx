import { Account } from '@9ja-vote/shared-types';
import { AccountRowActions } from '../../components/AccountRowActions';
import { CreateAccountForm } from '../../components/CreateAccountForm';
import { Shell } from '../../components/Shell';
import { apiSafe } from '../../lib/api';
import { can, requireSession } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const { account, token } = await requireSession();
  const permitted = can(account, 'admin.users.manage');
  const { data, error } = permitted
    ? await apiSafe<Account[]>('/admin/accounts', [], token)
    : { data: [] as Account[], error: 'Your role does not include admin.users.manage.' };

  return (
    <Shell account={account} current="/accounts">
      <div>
        <p className="eyebrow" style={{ margin: 0 }}>Administrators</p>
        <h1 style={{ margin: '0.2rem 0 0' }}>Accounts and roles</h1>
        <p className="muted-sm" style={{ margin: '0.3rem 0 0' }}>
          Six roles, narrow permissions, no default credentials. These are command-centre accounts only — never voter
          records.
        </p>
      </div>

      {error ? <p className="banner error">{error}</p> : null}

      {permitted ? (
        <div className="card">
          <p className="eyebrow">New administrator</p>
          <CreateAccountForm />
        </div>
      ) : null}

      <div className="card">
        <p className="eyebrow">Existing accounts</p>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>MFA</th>
                <th>Last sign-in</th>
                {permitted ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.displayName}</strong>
                    {row.id === account.id ? <div className="muted-sm">you</div> : null}
                  </td>
                  <td className="muted-sm">{row.email}</td>
                  <td className="muted-sm">{row.role.replaceAll('_', ' ').toLowerCase()}</td>
                  <td>
                    <span className={`tag ${row.status === 'SUSPENDED' ? 'stop' : ''}`}>{row.status.toLowerCase()}</span>
                  </td>
                  <td>
                    <span className={`tag ${row.mfaEnabled ? '' : 'warn'}`}>{row.mfaEnabled ? 'on' : 'off'}</span>
                  </td>
                  <td className="muted-sm">
                    {row.lastLoginAt
                      ? new Date(row.lastLoginAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })
                      : 'never'}
                  </td>
                  {permitted ? (
                    <td>
                      {row.id === account.id ? (
                        <span className="muted-sm">Cannot change your own account</span>
                      ) : (
                        <AccountRowActions id={row.id} status={row.status} role={row.role} roles={['SUPER_ADMINISTRATOR', 'ELECTION_ADMINISTRATOR', 'DATA_MANAGER', 'RESULTS_VERIFICATION_OFFICER', 'SUPPORT_OFFICER', 'READ_ONLY_AUDITOR']} />
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && !error ? <p className="muted-sm">No accounts.</p> : null}
        </div>
        <p className="muted-sm" style={{ marginTop: '1rem', marginBottom: 0 }}>
          Suspension takes effect on the next request: the API re-reads the account on every authenticated call.
        </p>
      </div>
    </Shell>
  );
}
