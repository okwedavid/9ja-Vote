import { LowerThird } from '../components/LowerThird';
import { Scoreboard } from '../components/Scoreboard';
import { getResults } from '../lib/results';

export const dynamic = 'force-dynamic';

export default async function Broadcast({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const { via: _via, ...data } = await getResults();
  if (mode === 'lower-third') return <LowerThird initial={data} />;
  return <Scoreboard initial={data} />;
}
