import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildDemoPayload, buildSubResults, DEMO_PARTIES, RESULT_STATUS_LABEL, StateResult, SubResult } from '@9ja-vote/shared-types';
import { SiteFooter, SiteHeader } from '../../../components/SiteChrome';
import { apiGet } from '../../../lib/api';

export const dynamic = 'force-dynamic';

function fallbackState(code: string): StateResult | undefined {
  return buildDemoPayload().states.find((s) => s.stateCode === code.toUpperCase());
}

export default async function StateResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ lga?: string }>;
}) {
  const { state: stateCode } = await params;
  const { lga: lgaCode } = await searchParams;
  const fallback = fallbackState(stateCode);
  if (!fallback) notFound();

  const { data: state, via } = await apiGet<StateResult>(`/results/states/${stateCode}`, fallback);
  const { data: lgas } = await apiGet<SubResult[]>(`/results/states/${stateCode}/lgas`, buildSubResults(state, 'LGA'));
  const selected = lgaCode ? lgas.find((l) => l.code.toLowerCase() === lgaCode.toLowerCase()) : undefined;
  const { data: wards } = selected
    ? await apiGet<SubResult>(`/results/states/${stateCode}/lgas/${selected.code}`, { ...selected, children: buildSubResults(selected, 'WARD') })
    : { data: undefined as SubResult | undefined };

  const share = (votes: Record<string, number>) => {
    const total = Object.values(votes).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(votes)
      .map(([partyId, v]) => ({ partyId, share: v / total, votes: v }))
      .sort((a, b) => b.votes - a.votes);
  };

  return (
    <>
      <SiteHeader current="/results" />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/results">Results</Link>
              <span aria-hidden>/</span>
              <span>{state.stateName}</span>
            </nav>
            <h1>{state.stateName}</h1>
            <p className="lead">
              {state.totalValidVotes.toLocaleString('en-NG')} valid votes recorded ·{' '}
              {state.pollingUnitsReported.toLocaleString('en-NG')} of {state.pollingUnitsTotal.toLocaleString('en-NG')}{' '}
              polling units reported.
            </p>
            <div className="pill-row">
              <span className="pill pill-ghost">{RESULT_STATUS_LABEL[state.status]}</span>
              <span className="pill pill-ghost">Via {via === 'api' ? 'API' : 'offline bundle'}</span>
              <span className="pill pill-ghost">Synthetic</span>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container grid-2">
            <div className="card">
              <p className="eyebrow">Share of votes</p>
              <div className="bars">
                {share(state.votes).map((row) => {
                  const party = DEMO_PARTIES.find((p) => p.id === row.partyId);
                  return (
                    <div key={row.partyId} className="bar-row">
                      <span style={{ fontWeight: 700 }}>{party?.name ?? row.partyId}</span>
                      <span className="bar-track">
                        <span className="bar-fill" style={{ width: `${Math.max(2, row.share * 100)}%`, background: party?.colour }} />
                      </span>
                      <span className="bar-value">{row.votes.toLocaleString('en-NG')}</span>
                    </div>
                  );
                })}
              </div>
              <dl className="kv" style={{ marginTop: '1.2rem' }}>
                <dt>Leading so far</dt>
                <dd>{DEMO_PARTIES.find((p) => p.id === state.leadingPartyId)?.name ?? 'Tie or no data'}</dd>
                <dt>Status</dt>
                <dd>{RESULT_STATUS_LABEL[state.status]}</dd>
                <dt>Last updated</dt>
                <dd>{new Date(state.updatedAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT</dd>
                <dt>Declared winner</dt>
                <dd>None — declarations are INEC&rsquo;s function, not ours</dd>
              </dl>
            </div>

            <div className="card">
              <p className="eyebrow">Local government areas</p>
              <h2 style={{ fontSize: '1.3rem' }}>Where the figures come from</h2>
              <div className="stack">
                {lgas.map((lga) => (
                  <div key={lga.code} className="module">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <div>
                        <h3 style={{ marginBottom: '0.15rem' }}>{lga.name}</h3>
                        <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                          {lga.totalValidVotes.toLocaleString('en-NG')} votes · {lga.pollingUnitsReported}/
                          {lga.pollingUnitsTotal} units
                        </p>
                      </div>
                      <Link className="pill" href={`/results/${state.stateCode}?lga=${lga.code}`}>
                        Wards →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {wards?.children ? (
              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <p className="eyebrow">{wards.name}</p>
                <h2 style={{ fontSize: '1.3rem' }}>Wards</h2>
                <div className="table-wrap">
                  <table className="data">
                    <thead>
                      <tr>
                        <th>Ward</th>
                        <th className="num">Valid votes</th>
                        <th className="num">Units reported</th>
                        <th>Leading</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wards.children.map((ward) => (
                        <tr key={ward.code}>
                          <td>{ward.name}</td>
                          <td className="num">{ward.totalValidVotes.toLocaleString('en-NG')}</td>
                          <td className="num">
                            {ward.pollingUnitsReported}/{ward.pollingUnitsTotal}
                          </td>
                          <td>{DEMO_PARTIES.find((p) => p.id === ward.leadingPartyId)?.abbreviation ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="muted" style={{ marginTop: '0.8rem', marginBottom: 0, fontSize: '0.85rem' }}>
                  Lower-level splits are generated deterministically from the state totals so the drill-down can be tested.
                  They are synthetic and must never be treated as real figures.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
