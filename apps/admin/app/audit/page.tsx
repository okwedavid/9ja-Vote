import { AuditEntry } from '@9ja-vote/shared-types';
import { Shell } from '../../components/Shell';
import { apiSafe } from '../../lib/api';
import { can, requireSession } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  const { account, token } = await requireSession();
  const permitted = can(account, 'audit.read');
  const { data, error } = permitted
    ? await apiSafe<{ notice: string; items: AuditEntry[] }>('/admin/audit?limit=100', { notice: '', items: [] }, token)
    : { data: { notice: '', items: [] as AuditEntry[] }, error: 'Your role does not include audit.read.' };

  return (
    <Shell account={account} current="/audit">
      <div>
        <p className="eyebrow" style={{ margin: 0 }}>Audit log</p>
        <h1 style={{ margin: '0.2rem 0 0' }}>Append-only history</h1>
        <p className="muted-sm" style={{ margin: '0.3rem 0 0' }}>
          Sign-ins, failed sign-ins, account changes and result transitions. Nothing in the interface can edit or delete
          an entry.
        </p>
      </div>

      {error ? <p className="banner error">{error}</p> : null}

      <div className="card">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>When (WAT)</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Target</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((entry) => (
                <tr key={entry.id}>
                  <td className="muted-sm">
                    {new Date(entry.at).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'medium' })}
                  </td>
                  <td>{entry.actorEmail}</td>
                  <td className="muted-sm">{entry.actorRole ? entry.actorRole.replaceAll('_', ' ').toLowerCase() : '—'}</td>
                  <td>
                    <span className="tag">{entry.action.replaceAll('_', ' ')}</span>
                  </td>
                  <td className="mono">{entry.targetId}</td>
                  <td className="muted-sm">{entry.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.items.length === 0 && !error ? <p className="muted-sm">No entries yet.</p> : null}
        <p className="muted-sm" style={{ marginTop: '1rem', marginBottom: 0 }}>
          {data.notice || 'Retention: the demonstration store keeps the most recent 1,000 entries.'}
        </p>
      </div>
    </Shell>
  );
}
