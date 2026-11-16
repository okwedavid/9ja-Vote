import Link from 'next/link';
import { FAQ, GLOSSARY, LOCALES, SOURCE_REGISTER } from '@9ja-vote/shared-types';
import { SiteFooter, SiteHeader } from '../../components/SiteChrome';

export default function HelpPage() {
  return (
    <>
      <SiteHeader current="/help" />
      <main id="main">
        <section className="page-hero on-dark">
          <div className="container">
            <p className="eyebrow">Help</p>
            <h1>Questions, words and sources</h1>
            <p className="lead">
              What this platform is, what it is not, and where every figure has to come from. If an answer is missing,
              that is a gap to report — not a reason to guess.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container stack">
            <div className="card">
              <p className="eyebrow">Frequently asked</p>
              <h2 style={{ fontSize: '1.5rem' }}>Straight answers</h2>
              <div className="stack">
                {FAQ.map((item) => (
                  <details key={item.question} className="module">
                    <summary style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--emerald)' }}>{item.question}</summary>
                    <p className="muted" style={{ margin: '0.6rem 0 0' }}>
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>

            <div className="card" id="sources">
              <p className="eyebrow">Source register</p>
              <h2 style={{ fontSize: '1.5rem' }}>Where figures must come from</h2>
              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Publisher</th>
                      <th>Document</th>
                      <th>Accessed</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SOURCE_REGISTER.map((source) => (
                      <tr key={source.id}>
                        <td>{source.publisher}</td>
                        <td>
                          {source.url ? (
                            <a href={source.url} rel="noreferrer noopener" target="_blank">
                              {source.title}
                            </a>
                          ) : (
                            source.title
                          )}
                        </td>
                        <td>{new Date(source.accessedAt).toLocaleDateString('en-NG')}</td>
                        <td className="muted">{source.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="muted" style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.88rem' }}>
                A figure without a source reference and a timestamp is not published. Synthetic demonstration data is
                always labelled as such, in the interface and in the API response header.
              </p>
            </div>

            <div className="grid-2">
              <div className="card">
                <p className="eyebrow">Glossary</p>
                <h2 style={{ fontSize: '1.4rem' }}>The words on this site</h2>
                <dl className="kv">
                  {GLOSSARY.map((entry) => (
                    <div key={entry.term} style={{ display: 'contents' }}>
                      <dt>{entry.term}</dt>
                      <dd className="muted">{entry.definition}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="card" id="languages">
                <p className="eyebrow">Languages</p>
                <h2 style={{ fontSize: '1.4rem' }}>English today, more with review</h2>
                <p className="muted">
                  Hausa, Yorùbá, Igbo and Naijá are registered in the product, but their strings stay switched off until
                  qualified native speakers review them. Machine translation is not good enough for civic information.
                </p>
                <div className="stack">
                  {LOCALES.map((locale) => (
                    <div key={locale.code} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                      <span>
                        <strong>{locale.name}</strong>{' '}
                        <span className="muted" style={{ fontSize: '0.85rem' }}>
                          ({locale.englishName})
                        </span>
                      </span>
                      <span className="badge" data-status={locale.enabled ? 'VERIFIED' : 'UNDER_VERIFICATION'}>
                        {locale.enabled ? 'Available' : 'In review'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <p className="eyebrow">What we cannot do</p>
              <div className="grid-3">
                {[
                  ['Register you to vote', 'Only INEC can do that.'],
                  ['Collect your biometrics', 'No fingerprints or face images are captured anywhere.'],
                  ['Declare a winner', 'We show figures and their status. Declarations belong to INEC.'],
                  ['Accept incident reports', 'Emergencies must go to the authorities, not to a website.'],
                ].map(([title, text]) => (
                  <div key={title}>
                    <h3 style={{ fontSize: '1rem' }}>{title}</h3>
                    <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                      {text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pill-row" style={{ marginTop: '1rem' }}>
                <Link className="pill" href="/privacy">
                  Privacy and security
                </Link>
                <Link className="pill" href="/accessibility">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
