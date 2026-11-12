import { Scoreboard } from '../components/Scoreboard';
import { getResults } from '../lib/results';

export const dynamic = 'force-dynamic';

export default async function Broadcast() {
  const { via: _via, ...data } = await getResults();
  return <Scoreboard initial={data} />;
}
