import {
  ADMIN_ROLES,
  PERMISSIONS,
  RESULT_STATUS_LABEL,
  RESULT_STATUSES,
  ROLE_PERMISSIONS,
} from '@9ja-vote/shared-types';
import { Shell } from '../components/Shell';
import { apiSafe } from '../lib/api';
import { requireSession } from '../lib/session';

export const dynamic = 'force-dynamic';

interface Metrics {
  statesReporting: number;
  statesTotal: number;
  pollingUnitsReported: number;
  pollingUnitsTotal: number;
  totalValidVotes: number;
  verifiedStates: number;
  disputedStates: number;
  awaitingSubmission: number;
  accounts: { total: number; active: number; mfaEnabled: number };
  auditEntries: number;
  lastAuditAt: string | null;
  storeVersion: number;
  uptimeSeconds: number;
}

interface Workflow {
  byStatus: Record<string, number>;
  awaitingAction: number;
  total: number;
  oldestPendingAt: string | null;
}

interface AuditResponse {
  notice: string;
  items: Array<{ id: string; at: string; actorEmail: string; action: string; summary: string; targetId: string }>;
}

const title = (s: string) => s.replaceAll('_', ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());

export default async function Overview() {
  const { account, token } = await requireSession();

  const [{ data: metrics, error: metricsError }, { data: workflow }, { data: audit, error: auditError }] = await Promise.all([
    apiSafe<Metrics | null>('/admin/metrics', null, token),
    apiSafe<Workflow | null>('/admin/workflow', null, token),
    apiSafe<AuditResponse | null>('/admin/audit?limit=6', null, token),
  ]);

  const statusCounts = RESULT_STATUSES.map((status) => ({
    status,
    count: workflow?.byStatus?.[status] ?? 0,
  }));

  return (
    <Shell account={account} current="/">
      <div className="toolbar">
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>Overview</p>
          <h1 style={{ margin: '0.2rem 0 0' }}>Demonstration election status</h1>
          <p className="muted-sm" style={{ margin: '0.3rem 0 0' }}>
            Signed in as {account.email} · {account.role.replaceAll('_', ' ').toLowerCase()} · store v{metrics?.storeVersion ?? '—'}
          </p>
        </div>
        <span className="tag warn">SYNTHETIC DATA · NOT OFFICIAL</span>
      </div>

      {metricsError ? (
        <p className="banner error" role="alert">
          Could not reach the API: {metricsError}. The pages below will show placeholders until it is back.
        </p>
      ) : null}

      <div className="kpis">
        {[
          ['States reporting', metrics ? `${metrics.statesReporting} / ${metrics.statesTotal}` : '—'],
          ['Verified', metrics?.verifiedStates ?? '—'],
          ['Disputed', metrics?.disputedStates ?? '—'],
          ['Awaiting submission', metrics?.awaitingSubmission ?? '—'],
          ['In the queue', workflow?.awaitingAction ?? '—'],
          ['Administrators', metrics ? `${metrics.accounts.active} active / ${metrics.accounts.mfaEnabled} with MFA` : '—'],
        ].map(([label, value]) => (
          <div key={String(label)} className="card">
            <p className="eyebrow">{label}</p>
            <p className="stat">{value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Where the records sit</h2>
          </div>
          <a className="pill" href="/results" style={{ background: 'var(--mint)', color: 'var(--emerald)', padding: '0.4rem 0.9rem', borderRadius: 999, fontWeight: 700, textDecoration: 'none' }}>
            Open verification queue →
          </a>
        </div>
        <div className="scroll" style={{ marginTop: '1rem' }}>
          <table className="data">
            <thead>
              <tr>
                {statusCounts.map(({ status }) => (
                  <th key={status} className="num">
                    {RESULT_STATUS_LABEL[status]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {statusCounts.map(({ status, count }) => (
                  <td key={status} className="num">
                    {count}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="muted-sm" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
          Published values cannot be edited. A correction creates a new version and the previous one stays visible in the
          record history. The platform never declares a winner.
        </p>
      </div>

      <div className="card">
        <p className="eyebrow">Audit trail</p>
        <h2 style={{ fontSize: '1.25rem' }}>Latest administrative activity</h2>
        {auditError ? (
          <p className="banner info">
            Your role cannot read the audit log. Ask a super administrator or auditor to check it: {auditError}
          </p>
        ) : audit && audit.items.length > 0 ? (
          <table className="data">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {audit.items.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.at).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</td>
                  <td>{entry.actorEmail}</td>
                  <td>
                    <span className="tag">{entry.action.replaceAll('_', ' ')}</span>
                  </td>
                  <td className="muted-sm">{entry.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted-sm">No audit entries yet.</p>
        )}
      </div>

      <div className="card">
        <p className="eyebrow">Role-based access control</p>
        <h2 style={{ fontSize: '1.25rem' }}>Permission matrix (separation of duties)</h2>
        <div className="scroll">
          <table className="data matrix">
            <thead>
              <tr>
                <th>Role</th>
                {PERMISSIONS.map((p) => (
                  <th key={p} className="p">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ADMIN_ROLES.map((role) => (
                <tr key={role}>
                  <td>
                    <strong>{title(role)}</strong>
                  </td>
                  {PERMISSIONS.map((permission) => {
                    const has = ROLE_PERMISSIONS[role].includes(permission);
                    return (
                      <td key={permission} className={has ? 'yes' : 'no'} aria-label={has ? 'allowed' : 'not allowed'}>
                        {has ? '✓' : '·'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted-sm" style={{ marginTop: '1rem', marginBottom: 0 }}>
          The guards live on the server, so a hidden button is never the only protection. No role can see how an
          individual voted: ballot choices are never stored against an identity, so the permission does not exist.
        </p>
      </div>
    </Shell>
  );
}
