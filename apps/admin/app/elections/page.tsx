import { Election, ElectionCalendarItem } from '@9ja-vote/shared-types';
import { Shell } from '../../components/Shell';
import { apiSafe } from '../../lib/api';
import { requireSession } from '../../lib/session';

export const dynamic = 'force-dynamic';

interface Payload {
  notice: string;
  items: Election[];
  calendar: ElectionCalendarItem[];
}

export default async function ElectionsPage() {
  const { account, token } = await requireSession();
  const { data, error } = await apiSafe<Payload | null>('/elections', null, token);

  return (
    <Shell account={account} current="/elections">
      <div>
        <p className="eyebrow" style={{ margin: 0 }}>Elections</p>
        <h1 style={{ margin: '0.2rem 0 0' }}>Configured elections and timetable</h1>
        <p className="muted-sm" style={{ margin: '0.3rem 0 0' }}>
          Editing elections requires the <code>elections.configure</code> permission. Real dates must come from an INEC
          publication with a source reference.
        </p>
      </div>

      {error ? <p className="banner error">{error}</p> : null}

      {data ? (
        <>
          <div className="card">
            <p className="eyebrow">Election</p>
            <h2 style={{ fontSize: '1.25rem' }}>{data.items[0]?.title}</h2>
            <dl className="kv">
              <dt>Type</dt>
              <dd>{data.items[0]?.type.replaceAll('_', ' ').toLowerCase()}</dd>
              <dt>Date</dt>
              <dd>{data.items[0]?.date} (reported, unconfirmed)</dd>
              <dt>Data source</dt>
              <dd>{data.items[0]?.dataSource.replaceAll('_', ' ').toLowerCase()}</dd>
              <dt>Real voting</dt>
              <dd>
                <span className="tag stop">disabled permanently</span>
              </dd>
            </dl>
          </div>

          <div className="card">
            <p className="eyebrow">Calendar</p>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Phase</th>
                    <th>Item</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {data.calendar.map((item) => (
                    <tr key={item.id}>
                      <td className="muted-sm">{item.date}</td>
                      <td>
                        <span className="tag">{item.phase.replaceAll('_', ' ').toLowerCase()}</span>
                      </td>
                      <td>
                        <strong>{item.title}</strong>
                        <div className="muted-sm">{item.description}</div>
                      </td>
                      <td className="muted-sm">{item.sourceReference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </Shell>
  );
}
