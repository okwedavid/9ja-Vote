import { SiteFooter, SiteHeader } from '../../components/SiteChrome';

export const metadata = { title: 'Privacy and security — 9ja Vote' };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <p className="eyebrow">Privacy &amp; security</p>
            <h1>What we hold, and what we refuse to hold</h1>
            <p className="lead">
              This demonstration site collects no personal data. The Command Centre is the only place that stores
              accounts, and those are staff accounts — never voter records.
            </p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container grid-2">
            <div className="card">
              <p className="eyebrow">Public site</p>
              <h2 style={{ fontSize: '1.4rem' }}>Nothing to collect</h2>
              <dl className="kv">
                <dt>Accounts</dt>
                <dd>None on the public site.</dd>
                <dt>Cookies</dt>
                <dd>No analytics, no advertising, no tracking cookies.</dd>
                <dt>Server logs</dt>
                <dd>Standard request logs with addresses truncated; retained briefly for security.</dd>
                <dt>Location</dt>
                <dd>You choose a state manually. Nothing is geolocated.</dd>
              </dl>
            </div>

            <div className="card">
              <p className="eyebrow">Administrators</p>
              <h2 style={{ fontSize: '1.4rem' }}>Staff accounts only</h2>
              <dl className="kv">
                <dt>Stored</dt>
                <dd>Email, display name, role, password hash (scrypt), MFA secret.</dd>
                <dt>Never stored</dt>
                <dd>Voter identity documents, biometrics, ballot choices.</dd>
                <dt>Session</dt>
                <dd>Short-lived signed token in an HTTP-only cookie; sign-out revokes it.</dd>
                <dt>Audit</dt>
                <dd>Every administrative action is appended to a log that cannot be edited in the UI.</dd>
              </dl>
            </div>

            <div className="card">
              <p className="eyebrow">Separation of duties</p>
              <h2 style={{ fontSize: '1.4rem' }}>Identity and ballot never meet</h2>
              <p className="muted">
                Participation records (who turned out) and demonstration ballots (what was chosen) share no key and no
                table. No administrator permission can reveal an individual choice, because the data to do so does not
                exist in the schema.
              </p>
              <p className="muted" style={{ marginBottom: 0 }}>
                Six roles, each with a narrow permission set. A person who can ingest a result cannot verify it, and the
                person who verifies cannot publish a declaration.
              </p>
            </div>

            <div className="card">
              <p className="eyebrow">Security posture</p>
              <h2 style={{ fontSize: '1.4rem' }}>Claims we do not make</h2>
              <ul className="step-list">
                <li>We do not call this platform attack-proof.</li>
                <li>We do not claim to prevent every attempt at duplicate participation.</li>
                <li>We do not connect to INEC systems, IReV or any voter register.</li>
                <li>Every response is labelled demonstration data, including API responses.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
