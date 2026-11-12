import { Carousel3D, Slide } from '../components/Carousel3D';
import { Countdown } from '../components/Countdown';
import { Emblem } from '../components/Emblem';
import { ResultsPanel } from '../components/ResultsPanel';
import { en, LOCALES } from '../lib/i18n';
import { getResults } from '../lib/results';

export const dynamic = 'force-dynamic';

const slides: Slide[] = [
  { src: '/images/aso-rock.jpg', alt: 'Illustration of Aso Rock above Abuja at sunrise', title: 'Rooted in Abuja', text: 'A civic platform designed around Nigeria’s own institutions and laws.' },
  { src: '/images/slide-ballot.jpg', alt: 'Illustration of a ballot box with a green and white ribbon', title: 'One person, one vote — by design', text: 'Unique participation records and ballot secrecy are built into the data model.' },
  { src: '/images/slide-map.jpg', alt: 'Illustration of a glowing map of Nigeria with charts', title: 'Results you can trace', text: 'Every figure carries a source, a timestamp and a verification status.' },
  { src: '/images/slide-flag.jpg', alt: 'Green and white flag waving against the sky', title: en.tagline, text: 'Clear information for every voter, in every state.' },
  { src: '/images/slide-gate.jpg', alt: 'Illustration of a city boulevard and gate at dusk', title: 'Built for every Nigerian', text: 'Large buttons, readable text and light pages for older phones and slow networks.' },
];

const modules = [
  ['Voter education', 'How accreditation and voting work at your polling unit.', 'Planned · Day 3'],
  ['Election calendar', 'Key dates from INEC’s published timetable.', 'Planned · Day 4'],
  ['Party directory', 'Every registered party, sourced from INEC publications.', 'Planned · Day 4'],
  ['Candidates & manifestos', 'Election-specific candidate records with source references.', 'Planned · Day 4'],
  ['Identity verification demo', 'Synthetic identities only. No real biometrics collected.', 'Planned · Day 3'],
  ['Results transparency', 'Polling unit → ward → LGA → state → national.', 'Live demo below'],
  ['Broadcast graphics', 'OBS-ready full-screen scoreboard for television.', 'Scaffolded'],
  ['Command centre', 'Role-separated administration with audit trail.', 'Scaffolded'],
];

export default async function Home() {
  const data = await getResults();
  return (
    <>
      <header className="site-header on-dark">
        <div className="container header-inner">
          <a href="#main" className="brand"><Emblem /><span>9ja&nbsp;Vote</span></a>
          <nav aria-label="Primary">
            <a href="#highlights">Highlights</a>
            <a href="#modules">Modules</a>
            <a href="#results">Results demo</a>
            <a href="#trust">Trust</a>
          </nav>
          <label className="lang">
            <span className="sr-only">Language</span>
            <select defaultValue="en" aria-label="Language">
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code} disabled={!l.ready}>{l.label}{l.ready ? '' : ' (in translation)'}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <main id="main">
        <section className="hero on-dark">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Election information · Transparency · Controlled demonstration</p>
              <h1>Your Voice.<br />Your Future.<br /><span className="hl">Your Nigeria.</span></h1>
              <p className="lead">
                9ja Vote brings election information, voter education and traceable results into one calm,
                accessible place. This is an independent demonstration — real voting still happens in person,
                at your polling unit, under INEC.
              </p>
              <div className="cta-row">
                <a className="btn btn-primary" href="#results">See the results demo</a>
                <a className="btn btn-ghost" href="#trust">How we keep it honest</a>
              </div>
            </div>
            <div className="card card-dark countdown-card">
              <p className="eyebrow">Next general election</p>
              <h2 style={{ fontSize: '1.3rem' }}>Presidential &amp; National Assembly</h2>
              <Countdown target="2027-01-16T08:00:00+01:00" />
              <p className="muted" style={{ fontSize: '0.82rem', margin: 0 }}>
                16 January 2027, as cited in the project brief. Always confirm dates with INEC’s official timetable.
              </p>
            </div>
          </div>
        </section>

        <section id="highlights" className="section on-dark">
          <div className="container">
            <p className="eyebrow">Highlights</p>
            <h2 className="section-title">A platform worthy of the moment</h2>
            <Carousel3D slides={slides} />
          </div>
        </section>

        <section id="modules" className="section">
          <div className="container">
            <div className="card">
              <p className="eyebrow">What we are building</p>
              <h2 className="section-title dark">One platform, three connected products</h2>
              <div className="module-grid">
                {modules.map(([title, text, status]) => (
                  <article key={title} className="module">
                    <h3>{title}</h3>
                    <p className="muted">{text}</p>
                    <span className="badge">{status}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="results" className="section">
          <div className="container">
            <div className="results-head on-dark">
              <div>
                <p className="eyebrow">Results transparency engine</p>
                <h2 className="section-title">Live results demo</h2>
              </div>
              <span className="badge badge-demo">SYNTHETIC DATA · NOT OFFICIAL</span>
            </div>
            <ResultsPanel data={data} />
            <p className="source-note on-dark">
              Source: synthetic seed data via {data.via === 'api' ? '9ja Vote API' : 'bundled offline dataset'} ·
              generated {new Date(data.summary.generatedAt).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT
            </p>
          </div>
        </section>

        <section id="trust" className="section">
          <div className="container trust-grid">
            {[
              ['No remote voting', 'Legally operative internet voting is not implemented. Voting workflows are non-binding demonstrations only.'],
              ['No voter register', 'Creating an account here does not register you to vote. Only INEC maintains the register of voters.'],
              ['No real biometrics', 'The demo uses synthetic identities. No fingerprints, face images or identity documents are collected.'],
              ['No declared winners', 'We show figures with their source and status. Declaring results is INEC’s function alone.'],
            ].map(([t, d]) => (
              <article key={t} className="card card-dark">
                <h3>{t}</h3>
                <p className="muted" style={{ margin: 0 }}>{d}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer on-dark">
        <div className="container footer-inner">
          <div className="brand"><Emblem size={36} /><span>9ja Vote</span></div>
          <p>
            Independent demonstration project. Not an INEC platform and not an authorised voting system.
            The emblem is provisional and is not the Nigerian Coat of Arms. Photographs are AI-generated illustrations.
          </p>
        </div>
      </footer>
    </>
  );
}
