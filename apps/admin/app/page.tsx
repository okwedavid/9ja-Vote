import { ADMIN_ROLES, PERMISSIONS, RESULT_STATUSES, RESULT_STATUS_LABEL, ROLE_PERMISSIONS } from '@9ja-vote/shared-types';
import { Emblem } from '../components/Emblem';
import { getResults } from '../lib/results';

export const dynamic = 'force-dynamic';

const nav = ['Overview', 'Elections', 'Parties & candidates', 'Results verification', 'Administrators', 'Audit log', 'Security alerts'];
const title = (s: string) => s.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());

export default async function AdminHome() {
  const { summary, via } = await getResults();
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><Emblem size={38} /> Command Centre</div>
        <nav aria-label="Sections">
          {nav.map((n, i) => (
            <span key={n} aria-current={i === 0 ? 'page' : undefined}>{n} {i > 0 && <small>· planned</small>}</span>
          ))}
        </nav>
      </aside>
      <main className="content">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Demonstration election status</h1>
          <p className="muted">{summary.election.title} · data via {via === 'api' ? 'API' : 'bundled dataset'}</p>
        </div>
        <div className="kpis">
          {RESULT_STATUSES.map((s) => (
            <div className="card" key={s}>
              <p className="eyebrow">{RESULT_STATUS_LABEL[s]}</p>
              <p className="stat">{summary.statusBreakdown[s]}</p>
              <p className="muted">states</p>
            </div>
          ))}
        </div>
        <div className="card">
          <p className="eyebrow">Role-based access control</p>
          <h2>Permission matrix (separation of duties)</h2>
          <div className="scroll">
            <table className="data matrix">
              <thead>
                <tr><th>Role</th>{PERMISSIONS.map((p) => <th key={p} className="p">{p}</th>)}</tr>
              </thead>
              <tbody>
                {ADMIN_ROLES.map((r) => (
                  <tr key={r}>
                    <td><strong>{title(r)}</strong></td>
                    {PERMISSIONS.map((p) => {
                      const has = ROLE_PERMISSIONS[r].includes(p);
                      return <td key={p} className={has ? 'yes' : 'no'} aria-label={has ? 'allowed' : 'not allowed'}>{has ? '✓' : '·'}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted" style={{ marginTop: '1rem' }}>
            No role can see how an individual voted: ballot choices are never stored against an identity, so no such permission exists.
            Published results cannot be edited silently — corrections create a new, audited version.
          </p>
        </div>
      </main>
    </div>
  );
}
