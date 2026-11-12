import { buildDemoPayload, ResultsPayload } from '@9ja-vote/shared-types';

const API = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000';

/**
 * Server-side read of the results API. If the API cannot be reached the page
 * still renders from the bundled synthetic dataset (same generator the API
 * uses), so the demo degrades gracefully on poor networks.
 */
export async function getResults(): Promise<ResultsPayload & { via: 'api' | 'bundled' }> {
  try {
    const res = await fetch(`${API}/api/v1/results/national`, { cache: 'no-store', signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    return { ...((await res.json()) as ResultsPayload), via: 'api' };
  } catch {
    return { ...buildDemoPayload(), via: 'bundled' };
  }
}
