const API = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000';

/**
 * Server-side read from the API with a bundled fallback, so pages still render
 * on a slow or unavailable network instead of failing the whole site.
 */
export async function apiGet<T>(path: string, fallback: T): Promise<{ data: T; via: 'api' | 'bundled' }> {
  try {
    const res = await fetch(`${API}/api/v1${path}`, { cache: 'no-store', signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    return { data: (await res.json()) as T, via: 'api' };
  } catch {
    return { data: fallback, via: 'bundled' };
  }
}
