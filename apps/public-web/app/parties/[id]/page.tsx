import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Candidate, candidateForParty, DEMO_PARTIES, Party } from '@9ja-vote/shared-types';
import { SiteFooter, SiteHeader } from '../../../components/SiteChrome';
import { apiGet } from '../../../lib/api';

export const dynamic = 'force-dynamic';

interface Payload {
  party: Party;
  candidate: Candidate | null;
}

export default async function PartyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fallbackParty = DEMO_PARTIES.find((p) => p.id === id);
  if (!fallbackParty) notFound();

  const { data } = await apiGet<Payload>(`/parties/${id}`, {
    party: fallbackParty,
    candidate: candidateForParty(id) ?? null,
  });

  return (
    <>
      <SiteHeader current="/parties" />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden>/</span>
              <Link href="/parties">Parties</Link>
              <span aria-hidden>/</span>
              <span>{data.party.abbreviation}</span>
            </nav>
            <h1>{data.party.name}</h1>
            <p className="lead">{data.party.description}</p>
            <div className="pill-row">
              <span className="pill pill-ghost">{data.party.abbreviation}</span>
              <span className="pill pill-ghost">{data.party.verificationStatus.replaceAll('_', ' ')}</span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2">
            <div className="card">
              <p className="eyebrow">Candidate</p>
              <h2 style={{ fontSize: '1.4rem' }}>{data.candidate?.name ?? 'No candidate loaded'}</h2>
              <p className="muted">{data.candidate?.slogan}</p>
              <dl className="kv">
                <dt>Age</dt>
                <dd>{data.candidate?.age ?? '—'}</dd>
                <dt>Home state</dt>
                <dd>{data.candidate?.homeStateCode ?? '—'}</dd>
                <dt>Source</dt>
                <dd>{data.candidate?.sourceReference ?? data.party.sourceReference}</dd>
                <dt>Last updated</dt>
                <dd>{new Date(data.candidate?.lastUpdated ?? data.party.lastUpdated).toLocaleDateString('en-NG')}</dd>
              </dl>
            </div>

            <div className="card">
              <p className="eyebrow">Manifesto pledges</p>
              <h2 style={{ fontSize: '1.4rem' }}>What they say they would do</h2>
              <div className="stack">
                {(data.candidate?.manifesto ?? []).map((pledge) => (
                  <div key={pledge.title}>
                    <h3 style={{ fontSize: '1.02rem', marginBottom: '0.2rem' }}>{pledge.title}</h3>
                    <p className="muted" style={{ margin: 0 }}>
                      {pledge.summary}
                    </p>
                  </div>
                ))}
                {!data.candidate ? <p className="empty">No manifesto is published for this demonstration record.</p> : null}
              </div>
            </div>

            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <p className="eyebrow">Verification</p>
              <p className="muted" style={{ marginBottom: '0.8rem' }}>
                A record can only move from <em>unverified</em> to <em>verified against INEC</em> when a data manager
                attaches a source reference and a second officer approves it. This record is synthetic, so it can never
                reach that state.
              </p>
              <Link className="pill" href="/help#sources">
                How source references work →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
