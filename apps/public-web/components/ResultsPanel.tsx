import { Party, RESULT_STATUS_LABEL, ResultsPayload, STATES } from '@9ja-vote/shared-types';

const fmt = new Intl.NumberFormat('en-NG');
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export function ResultsPanel({ data }: { data: ResultsPayload }) {
  const { summary, parties, states } = data;
  const party = (id: string | null): Party | undefined => parties.find((p) => p.id === id);
  const byCode = new Map(states.map((s) => [s.stateCode, s]));

  return (
    <div className="results-grid">
      <div className="card">
        <p className="eyebrow">National tally · figures received so far</p>
        <h3>{summary.election.title}</h3>
        <div className="bars" style={{ marginTop: '1.2rem' }}>
          {summary.totals.map((t) => {
            const p = party(t.partyId)!;
            return (
              <div className="bar-row" key={t.partyId}>
                <span><span className="dot" style={{ background: p.colour }} />{p.name}</span>
                <div className="bar-track" role="img" aria-label={`${p.name} ${pct(t.share)}`}>
                  <div className="bar-fill" style={{ width: pct(t.share), background: p.colour }} />
                </div>
                <span className="bar-value">{pct(t.share)}<br /><small className="muted">{fmt.format(t.votes)}</small></span>
              </div>
            );
          })}
        </div>
        <p className="muted" style={{ marginTop: '1.2rem', fontSize: '0.86rem' }}>
          No winner is shown. Only INEC can declare the result of a Nigerian election.
        </p>
      </div>

      <div className="card">
        <p className="eyebrow">Schematic state map</p>
        <h3>Who leads where (demo)</h3>
        <div className="tilemap" role="list" aria-label="States coloured by leading demo party">
          {STATES.map((s) => {
            const r = byCode.get(s.code);
            const lead = party(r?.leadingPartyId ?? null);
            const pending = !r || r.status === 'AWAITING_SUBMISSION';
            return (
              <div
                key={s.code}
                role="listitem"
                className="tile"
                data-pending={pending}
                data-status={r?.status}
                title={`${s.name}: ${pending ? 'awaiting submission' : `${lead?.name ?? 'tied'} leading · ${RESULT_STATUS_LABEL[r!.status]}`}`}
                style={{ gridColumn: s.tile[0] + 1, gridRow: s.tile[1] + 1, background: lead?.colour ?? '#9aa39f' }}
              >
                {s.code}
              </div>
            );
          })}
        </div>
        <p className="muted" style={{ marginTop: '1rem', fontSize: '0.86rem' }}>
          Tiles are a layout aid, not a geographic map. Hatched = awaiting submission. “!” = disputed.
        </p>
      </div>

      <div className="card stats-card">
        <div><p className="eyebrow">Valid votes (demo)</p><p className="stat">{fmt.format(summary.totalValidVotes)}</p></div>
        <div><p className="eyebrow">States reporting</p><p className="stat">{summary.statesReporting}/{summary.statesTotal}</p></div>
        <div><p className="eyebrow">Polling units</p><p className="stat">{pct(summary.pollingUnitsReported / summary.pollingUnitsTotal)}</p></div>
        <div><p className="eyebrow">Verified states</p><p className="stat">{summary.statusBreakdown.VERIFIED}</p></div>
      </div>

      <div className="card table-card">
        <p className="eyebrow">State breakdown</p>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr><th>State</th><th>Status</th><th>Leading (not declared)</th><th className="num">Valid votes</th><th className="num">PUs reported</th></tr>
            </thead>
            <tbody>
              {states.map((s) => {
                const lead = party(s.leadingPartyId);
                return (
                  <tr key={s.stateCode}>
                    <td><strong>{s.stateName}</strong></td>
                    <td><span className="badge" data-status={s.status}>{RESULT_STATUS_LABEL[s.status]}</span></td>
                    <td>{s.status === 'AWAITING_SUBMISSION' || !lead ? '—' : (<><span className="dot" style={{ background: lead.colour }} />{lead.name}</>)}</td>
                    <td className="num">{fmt.format(s.totalValidVotes)}</td>
                    <td className="num">{fmt.format(s.pollingUnitsReported)} / {fmt.format(s.pollingUnitsTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
