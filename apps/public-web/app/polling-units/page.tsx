import { buildDemoPollingUnits, PollingUnit, STATES } from '@9ja-vote/shared-types';
import { SiteFooter, SiteHeader } from '../../components/SiteChrome';
import { apiGet } from '../../lib/api';

export const dynamic = 'force-dynamic';

interface Payload {
  notice: string;
  total: number;
  items: PollingUnit[];
}

export default async function PollingUnitsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; q?: string }>;
}) {
  const { state = 'LA', q } = await searchParams;
  const stateInfo = STATES.find((s) => s.code === state.toUpperCase()) ?? STATES[0]!;
  const query = new URLSearchParams({ state: stateInfo.code });
  if (q) query.set('q', q);

  const fallbackUnits = buildDemoPollingUnits(stateInfo.code, stateInfo.name).filter((u) =>
    q ? u.name.toLowerCase().includes(q.toLowerCase()) || u.code.toLowerCase().includes(q.toLowerCase()) : true,
  );
  const { data, via } = await apiGet<Payload>(`/polling-units?${query.toString()}`, {
    notice: 'Synthetic polling units',
    total: fallbackUnits.length,
    items: fallbackUnits.slice(0, 50),
  });

  return (
    <>
      <SiteHeader current="/polling-units" />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <p className="eyebrow">Polling units</p>
            <h1>Find where you would vote</h1>
            <p className="lead">
              The demo dataset contains synthetic polling units for every state. In production these records would be
              imported from INEC with a source reference — never guessed.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container stack">
            <div className="card">
              <form className="search-form" method="get" action="/polling-units">
                <label className="field">
                  <span>State</span>
                  <select name="state" defaultValue={stateInfo.code}>
                    {STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Search by name or code</span>
                  <input name="q" defaultValue={q ?? ''} placeholder="e.g. Ward 01 or LA-LGA-01" />
                </label>
                <button className="btn btn-primary" type="submit">
                  Search
                </button>
              </form>
              <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>
                {data.total.toLocaleString('en-NG')} results in {stateInfo.name} · via {via === 'api' ? 'API' : 'offline bundle'} ·{' '}
                {data.notice}
              </p>
            </div>

            <div className="card">
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Unit</th>
                      <th>Ward</th>
                      <th>LGA</th>
                      <th className="num">Registered voters</th>
                      <th>Accessible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((unit) => (
                      <tr key={unit.code}>
                        <td>
                          <code style={{ fontSize: '0.85rem' }}>{unit.code}</code>
                        </td>
                        <td>{unit.name}</td>
                        <td>{unit.wardName}</td>
                        <td>{unit.lgaName}</td>
                        <td className="num">{unit.registeredVoters.toLocaleString('en-NG')}</td>
                        <td>{unit.accessible ? 'Yes' : 'Limited'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.items.length === 0 ? <p className="empty">No synthetic units matched that search.</p> : null}
              <p className="muted" style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.85rem' }}>
                Codes, names and voter counts are invented for demonstration. Do not use them to plan travel to a real
                polling unit.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
