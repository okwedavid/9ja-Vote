import { LOCALES } from '@9ja-vote/shared-types';
import { Shell } from '../../components/Shell';
import { apiSafe } from '../../lib/api';
import { requireSession } from '../../lib/session';

export const dynamic = 'force-dynamic';

interface Feature {
  key: string;
  label: string;
  status: 'LIVE' | 'IN_REVIEW' | 'PLANNED';
  note: string;
}

interface Meta {
  name: string;
  version: string;
  build: string;
  classification: string;
  realVotingEnabled: boolean;
  inecResultsIntegrationEnabled: boolean;
  features: Feature[];
  locales: typeof LOCALES;
}

export default async function PlatformPage() {
  const { account, token } = await requireSession();
  const { data: meta, error } = await apiSafe<Meta | null>('/meta', null, token);

  return (
    <Shell account={account} current="/platform">
      <div>
        <p className="eyebrow" style={{ margin: 0 }}>Platform status</p>
        <h1 style={{ margin: '0.2rem 0 0' }}>What is live, what is not</h1>
        <p className="muted-sm" style={{ margin: '0.3rem 0 0' }}>
          The API reports its own feature flags. Nothing on this page can be turned on from the interface.
        </p>
      </div>

      {error ? <p className="banner error">{error}</p> : null}

      {meta ? (
        <>
          <div className="card">
            <p className="eyebrow">Build</p>
            <dl className="kv">
              <dt>Service</dt>
              <dd>{meta.name}</dd>
              <dt>Version</dt>
              <dd>{meta.version}</dd>
              <dt>Build</dt>
              <dd className="mono">{meta.build}</dd>
              <dt>Classification</dt>
              <dd>
                <span className="tag warn">{meta.classification}</span>
              </dd>
              <dt>Real voting</dt>
              <dd>{meta.realVotingEnabled ? 'enabled (this must never happen)' : 'disabled'}</dd>
              <dt>INEC results integration</dt>
              <dd>{meta.inecResultsIntegrationEnabled ? 'enabled' : 'not configured'}</dd>
            </dl>
          </div>

          <div className="card">
            <p className="eyebrow">Features</p>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Status</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {meta.features.map((feature) => (
                    <tr key={feature.key}>
                      <td>
                        <strong>{feature.label}</strong>
                      </td>
                      <td>
                        <span className={`tag ${feature.status === 'LIVE' ? '' : 'warn'}`}>{feature.status.replaceAll('_', ' ').toLowerCase()}</span>
                      </td>
                      <td className="muted-sm">{feature.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <p className="eyebrow">Locales</p>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Locale</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {meta.locales.map((locale) => (
                    <tr key={locale.code}>
                      <td className="mono">{locale.code}</td>
                      <td>{locale.name}</td>
                      <td>
                        <span className={`tag ${locale.enabled ? '' : 'warn'}`}>{locale.status.replaceAll('_', ' ').toLowerCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted-sm" style={{ marginTop: '0.8rem', marginBottom: 0 }}>
              Non-English strings stay disabled until native speakers review them. Machine translation is not acceptable
              for civic information.
            </p>
          </div>
        </>
      ) : null}
    </Shell>
  );
}
