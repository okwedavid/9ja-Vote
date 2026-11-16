import Link from 'next/link';
import { Candidate, DEMO_PARTIES, Party } from '@9ja-vote/shared-types';
import { SiteFooter, SiteHeader } from '../../components/SiteChrome';
import { apiGet } from '../../lib/api';

export const dynamic = 'force-dynamic';

type Item = Party & { candidate?: Candidate };

export default async function PartiesPage() {
  const { data, via } = await apiGet<{ notice: string; items: Item[] }>('/parties', {
    notice: 'Synthetic demonstration parties',
    items: DEMO_PARTIES,
  });

  return (
    <>
      <SiteHeader current="/parties" />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <p className="eyebrow">Party directory</p>
            <h1>Parties and their candidates</h1>
            <p className="lead">
              Every party record carries its verification status and a source reference. The five parties below are
              fictional placeholders used only to exercise the platform — no real party or candidate is invented here.
            </p>
            <div className="pill-row">
              <span className="pill pill-ghost">Data via {via === 'api' ? 'API' : 'offline bundle'}</span>
              <span className="pill pill-ghost">Verification required before publication</span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="notice" style={{ marginBottom: '1.2rem' }}>
              <strong>Why placeholders?</strong>
              Creating a party or candidate record requires a verified INEC publication, a source reference and a
              timestamp. Until an authorised data manager loads one, the directory stays deliberately fictional.
            </div>
            <div className="grid-2">
              {data.items.map((party) => (
                <article key={party.id} className="card">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span
                      aria-hidden
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: party.colour,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        fontWeight: 800,
                      }}
                    >
                      {party.abbreviation.slice(0, 2)}
                    </span>
                    <div>
                      <h2 style={{ fontSize: '1.15rem', marginBottom: '0.1rem' }}>{party.name}</h2>
                      <p className="muted" style={{ margin: 0, fontSize: '0.85rem' }}>
                        {party.abbreviation} · {party.verificationStatus.replaceAll('_', ' ').toLowerCase()}
                      </p>
                    </div>
                  </div>
                  <p className="muted" style={{ marginTop: '0.9rem' }}>
                    {party.description}
                  </p>
                  {party.candidate ? (
                    <dl className="kv" style={{ marginBottom: '0.9rem' }}>
                      <dt>Candidate</dt>
                      <dd>{party.candidate.name}</dd>
                      <dt>Slogan</dt>
                      <dd>{party.candidate.slogan}</dd>
                    </dl>
                  ) : null}
                  <Link className="pill" href={`/parties/${party.id}`}>
                    Manifesto and source →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
