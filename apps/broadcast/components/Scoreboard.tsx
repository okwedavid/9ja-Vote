'use client';
import { RESULT_STATUS_LABEL, ResultsPayload, STATES } from '@9ja-vote/shared-types';
import { useEffect, useState } from 'react';
import { Emblem } from './Emblem';

const fmt = new Intl.NumberFormat('en-NG');
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/** Reads the same results API as the public site, via the same-origin /api proxy. */
export function Scoreboard({ initial }: { initial: ResultsPayload }) {
  const [data, setData] = useState(initial);
  const [clock, setClock] = useState('');
  const [stale, setStale] = useState(false);
  const [scale, setScale] = useState(1);
  const [transparent, setTransparent] = useState(false);

  useEffect(() => {
    setTransparent(new URLSearchParams(window.location.search).get('transparent') === '1');
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener('resize', fit);
    const tick = setInterval(
      () => setClock(new Date().toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos', hour12: false })),
      1000,
    );
    const poll = setInterval(async () => {
      try {
        const res = await fetch('/api/v1/results/national', { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        setData((await res.json()) as ResultsPayload);
        setStale(false);
      } catch {
        setStale(true); // keep showing last good data, flagged on screen
      }
    }, 10_000);
    return () => {
      window.removeEventListener('resize', fit);
      clearInterval(tick);
      clearInterval(poll);
    };
  }, []);

  const { summary, parties, states } = data;
  const party = (id: string | null) => parties.find((p) => p.id === id);
  const byCode = new Map(states.map((s) => [s.stateCode, s]));

  return (
    <div className="frame" data-transparent={transparent}>
      <div className="canvas" style={{ transform: `scale(${scale})` }}>
        <div className="top">
          <Emblem size={84} />
          <div>
            <h1>9ja Vote Live</h1>
            <div className="sub">{summary.election.title}</div>
          </div>
          <div className="live"><span className="pulse" />DEMONSTRATION DATA · NOT OFFICIAL</div>
        </div>

        <div className="body">
          <div className="score">
            {summary.totals.map((t) => {
              const p = party(t.partyId)!;
              return (
                <div className="row" key={t.partyId}>
                  <span><span className="dot" style={{ background: p.colour }} />{p.name}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: pct(t.share), background: p.colour }} /></div>
                  <span className="v">{pct(t.share)}<small>{fmt.format(t.votes)} · {t.statesLeading} states</small></span>
                </div>
              );
            })}
          </div>
          <div className="right">
            <div className="tilemap">
              {STATES.map((s) => {
                const r = byCode.get(s.code);
                const pending = !r || r.status === 'AWAITING_SUBMISSION';
                return (
                  <div
                    key={s.code}
                    className="tile"
                    data-pending={pending}
                    data-status={r?.status}
                    title={r ? RESULT_STATUS_LABEL[r.status] : ''}
                    style={{ gridColumn: s.tile[0] + 1, gridRow: s.tile[1] + 1, background: party(r?.leadingPartyId ?? null)?.colour ?? '#9aa39f' }}
                  >
                    {s.code}
                  </div>
                );
              })}
            </div>
            <div className="legend">Schematic map · colour = leading in figures received · hatched = awaiting · ! = disputed</div>
          </div>
        </div>

        <div className="bottom">
          <span><strong>{summary.statesReporting}</strong>/{summary.statesTotal} states reporting · <strong>{summary.statusBreakdown.VERIFIED}</strong> verified · <strong>{summary.statusBreakdown.DISPUTED}</strong> disputed</span>
          <span>Polling units <strong>{pct(summary.pollingUnitsReported / summary.pollingUnitsTotal)}</strong></span>
          <span>{stale ? 'CONNECTION LOST · showing last data' : 'No winner declared · only INEC declares results'}</span>
          <span><strong>{clock}</strong> WAT</span>
        </div>
      </div>
    </div>
  );
}
