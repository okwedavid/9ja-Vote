import { RESULT_STATUS_LABEL, ResultsPayload, WorkflowSummary } from '@9ja-vote/shared-types';
import { Shell } from '../../components/Shell';
import { TransitionForm } from '../../components/TransitionForm';
import { buildDemoPayload } from '@9ja-vote/shared-types';
import { apiSafe } from '../../lib/api';
import { availableTransitions } from '../../lib/roles';
import { requireSession } from '../../lib/session';

export const dynamic = 'force-dynamic';

export default async function ResultsVerificationPage() {
  const { account, token } = await requireSession();
  const [{ data: payload, error }, { data: workflow }] = await Promise.all([
    apiSafe<ResultsPayload>('/results/national', buildDemoPayload(), token),
    apiSafe<WorkflowSummary | null>('/results/workflow', null, token),
  ]);

  return (
    <Shell account={account} current="/results">
      <div className="toolbar">
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>Results verification</p>
          <h1 style={{ margin: '0.2rem 0 0' }}>Seven-stage workflow</h1>
          <p className="muted-sm" style={{ margin: '0.3rem 0 0' }}>
            Awaiting submission → submitted → received → under verification → verified. Disputes can be raised at any
            point and reopened for verification.
          </p>
        </div>
        <span className="tag warn">SYNTHETIC DATA</span>
      </div>

      {error ? <p className="banner error">Results API unreachable: {error}. Showing the bundled dataset.</p> : null}

      <div className="kpis">
        {[
          ['Records', workflow?.total ?? payload.states.length],
          ['Awaiting action', workflow?.awaitingAction ?? '—'],
          ['Verified', workflow?.byStatus?.VERIFIED ?? '—'],
          ['Disputed', workflow?.byStatus?.DISPUTED ?? '—'],
        ].map(([label, value]) => (
          <div key={String(label)} className="card">
            <p className="eyebrow">{label}</p>
            <p className="stat">{value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <p className="banner info" style={{ marginTop: 0 }}>
          Moving a record to <strong>verified</strong> needs the verification permission; <strong>recording an
          authorised declaration</strong> needs the publish permission; <strong>submitting a sheet</strong> needs the
          ingest permission. A super administrator holds none of those by design.
        </p>
        <div className="scroll">
          <table className="data">
            <thead>
              <tr>
                <th>State</th>
                <th>Status</th>
                <th className="num">Valid votes</th>
                <th className="num">Units</th>
                <th>Updated (WAT)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payload.states.map((state) => (
                <tr key={state.stateCode}>
                  <td>
                    <strong>{state.stateName}</strong>
                    <div className="muted-sm">{state.stateCode}</div>
                  </td>
                  <td>
                    <span className="badge" data-status={state.status}>
                      {RESULT_STATUS_LABEL[state.status]}
                    </span>
                  </td>
                  <td className="num">{state.totalValidVotes.toLocaleString('en-NG')}</td>
                  <td className="num">
                    {state.pollingUnitsReported.toLocaleString('en-NG')} / {state.pollingUnitsTotal.toLocaleString('en-NG')}
                  </td>
                  <td className="muted-sm">
                    {new Date(state.updatedAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td>
                    <TransitionForm stateCode={state.stateCode} options={availableTransitions(state.status, account.role)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <p className="eyebrow">Guarantees</p>
        <ul className="muted-sm" style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li>Every transition is appended to the audit log with the actor, the previous status and the note.</li>
          <li>Published figures are immutable; corrections create a new version rather than editing history.</li>
          <li>No endpoint computes or declares a winner — <code>declaredWinner</code> is always null.</li>
          <li>Lower-level LGA and ward figures are derived deterministically from state totals for demonstration.</li>
        </ul>
      </div>
    </Shell>
  );
}
