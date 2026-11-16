import Link from 'next/link';
import { RESULT_STATUS_LABEL } from '@9ja-vote/shared-types';
import { SiteFooter, SiteHeader } from '../../components/SiteChrome';
import { getResults } from '../../lib/results';

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const data = await getResults();
  const { summary } = data;

  return (
    <>
      <SiteHeader current="/results" />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <p className="eyebrow">Results transparency</p>
            <h1>Follow the figures down</h1>
            <p className="lead">
              National totals, then each state, then local government areas and wards. Every row shows its status:
              received, under verification, verified or disputed. This platform never declares a winner.
            </p>
            <div className="pill-row">
              <span className="pill pill-ghost">Synthetic data · not official</span>
              <span className="pill pill-ghost">Via {data.via === 'api' ? 'API' : 'offline bundle'}</span>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container stack">
            <div className="grid-3">
              {[
                ['Total valid votes', summary.totalValidVotes.toLocaleString('en-NG')],
                ['States reporting', `${summary.statesReporting} / ${summary.statesTotal}`],
                ['Polling units reported', `${summary.pollingUnitsReported.toLocaleString('en-NG')}`],
              ].map(([label, value]) => (
                <div key={label} className="card">
                  <p className="eyebrow">{label}</p>
                  <p className="stat" style={{ color: 'var(--emerald)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <p className="eyebrow">Share of votes</p>
                  <h2 style={{ fontSize: '1.4rem' }}>All parties</h2>
                </div>
                <span className="badge badge-demo">NO WINNER DECLARED</span>
              </div>
              <div className="bars" style={{ marginTop: '1rem' }}>
                {summary.totals.map((t) => {
                  const party = data.parties.find((p) => p.id === t.partyId);
                  return (
                    <div key={t.partyId} className="bar-row">
                      <span style={{ fontWeight: 700 }}>{party?.name ?? t.partyId}</span>
                      <span className="bar-track">
                        <span
                          className="bar-fill"
                          style={{ width: `${Math.max(2, Math.round(t.share * 100))}%`, background: party?.colour ?? '#008751' }}
                        />
                      </span>
                      <span className="bar-value">{(t.share * 100).toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
              <p className="muted" style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.85rem' }}>
                Percentages are of valid votes received so far, not of registered voters. {summary.notice}
              </p>
            </div>

            <div className="card">
              <p className="eyebrow">By state</p>
              <h2 style={{ fontSize: '1.4rem' }}>Choose a state</h2>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>State</th>
                      <th>Status</th>
                      <th className="num">Valid votes</th>
                      <th className="num">Units reported</th>
                      <th aria-label="Open" />
                    </tr>
                  </thead>
                  <tbody>
                    {data.states.map((s) => (
                      <tr key={s.stateCode}>
                        <td>
                          <strong>{s.stateName}</strong>
                        </td>
                        <td>
                          <span className="badge" data-status={s.status}>
                            {RESULT_STATUS_LABEL[s.status]}
                          </span>
                        </td>
                        <td className="num">{s.totalValidVotes.toLocaleString('en-NG')}</td>
                        <td className="num">
                          {s.pollingUnitsReported.toLocaleString('en-NG')} / {s.pollingUnitsTotal.toLocaleString('en-NG')}
                        </td>
                        <td className="num">
                          <Link href={`/results/${s.stateCode}`}>Open →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
