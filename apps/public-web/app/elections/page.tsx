import Link from 'next/link';
import { DEMO_CALENDAR, DEMO_ELECTION } from '@9ja-vote/shared-types';
import { SiteFooter, SiteHeader } from '../../components/SiteChrome';
import { apiGet } from '../../lib/api';

export const dynamic = 'force-dynamic';

type CalendarItem = (typeof DEMO_CALENDAR)[number];
interface Payload {
  notice: string;
  items: (typeof DEMO_ELECTION)[];
  calendar: CalendarItem[];
}

export default async function ElectionsPage() {
  const { data, via } = await apiGet<Payload>('/elections', {
    notice: 'Demonstration data',
    items: [DEMO_ELECTION],
    calendar: DEMO_CALENDAR,
  });

  return (
    <>
      <SiteHeader current="/elections" />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <p className="eyebrow">Election calendar</p>
            <h1>What happens when</h1>
            <p className="lead">
              A demonstration timetable for the phases of an election, from registration through collation. Dates must
              always be checked against INEC&rsquo;s published timetable before they are treated as fact.
            </p>
            <div className="pill-row">
              <span className="pill pill-ghost">
                <span className="live-dot" aria-hidden /> Data via {via === 'api' ? 'API' : 'offline bundle'}
              </span>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container grid-2">
            <div className="card">
              <p className="eyebrow">Timetable</p>
              <h2 className="section-title dark" style={{ fontSize: '1.6rem' }}>
                Phases and dates
              </h2>
              <ul className="timeline">
                {data.calendar.map((item) => (
                  <li key={item.id}>
                    <time dateTime={item.date}>
                      {new Date(item.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </time>
                    <div>
                      <h4>{item.title}</h4>
                      <p className="muted">{item.description}</p>
                      <p className="muted" style={{ fontSize: '0.8rem', margin: '0.3rem 0 0' }}>
                        Source: {item.sourceReference}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="stack">
              <div className="card">
                <p className="eyebrow">On the ballot</p>
                <h2 style={{ fontSize: '1.35rem' }}>{data.items[0]?.title}</h2>
                <dl className="kv">
                  <dt>Type</dt>
                  <dd>Presidential</dd>
                  <dt>Reported date</dt>
                  <dd>16 January 2027</dd>
                  <dt>Data source</dt>
                  <dd>Synthetic demonstration</dd>
                  <dt>Real voting</dt>
                  <dd>Disabled in this platform, permanently</dd>
                </dl>
              </div>
              <div className="notice">
                <strong>Dates are not authoritative.</strong>
                This calendar exists to test the interface. INEC publishes the only timetable that matters — confirm
                every date before sharing it.
              </div>
              <div className="card">
                <p className="eyebrow">Related</p>
                <div className="grid-3">
                  <Link className="link-card card" href="/voter-education">
                    <h3>Voter education</h3>
                    <p>How accreditation and voting work.</p>
                  </Link>
                  <Link className="link-card card" href="/polling-units">
                    <h3>Polling units</h3>
                    <p>Look up a unit in the demo dataset.</p>
                  </Link>
                  <Link className="link-card card" href="/results">
                    <h3>Results</h3>
                    <p>Follow figures down to ward level.</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
