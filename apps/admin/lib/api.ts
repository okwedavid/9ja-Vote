export const API = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Server-side call to the API. Never used from the browser: the token stays in an HTTP-only cookie. */
export async function apiFetch<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message.join(' ') : (body.message ?? `API responded ${res.status}`);
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiSafe<T>(path: string, fallback: T, token?: string): Promise<{ data: T; error: string | null }> {
  try {
    return { data: await apiFetch<T>(path, {}, token), error: null };
  } catch (error) {
    return { data: fallback, error: error instanceof Error ? error.message : 'API unreachable' };
  }
}
