export class ApiError extends Error {
  status: number;
  details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  json?: unknown;
  body?: BodyInit;
  signal?: AbortSignal;
};

let refreshPromise: Promise<boolean> | null = null;

function normalizeMessages(payload: unknown, fallback: string): {
  message: string;
  details: string[];
} {
  if (!payload || typeof payload !== 'object') {
    return { message: fallback, details: [] };
  }

  const body = payload as { message?: unknown };
  if (Array.isArray(body.message)) {
    const details = body.message.filter(
      (item): item is string => typeof item === 'string',
    );
    return { message: details[0] ?? fallback, details };
  }

  if (typeof body.message === 'string') {
    return { message: body.message, details: [] };
  }

  return { message: fallback, details: [] };
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function shouldAttemptRefresh(path: string): boolean {
  return ![
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/logout',
  ].includes(path);
}

export async function api<T>(
  path: string,
  options: ApiOptions = {},
  canRetry = true,
): Promise<T> {
  const { method = 'GET', json, body, signal } = options;
  const headers = new Headers();
  let requestBody = body;

  if (json !== undefined) {
    headers.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(json);
  }

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: requestBody,
      credentials: 'include',
      cache: 'no-store',
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiError(
      'Unable to reach DocSpace. Check your connection and try again.',
      0,
    );
  }

  if (
    response.status === 401 &&
    canRetry &&
    shouldAttemptRefresh(path) &&
    (await tryRefresh())
  ) {
    return api<T>(path, options, false);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // The server normally returns JSON; keep a useful fallback if it does not.
  }

  if (!response.ok) {
    const normalized = normalizeMessages(payload, 'Something went wrong');
    throw new ApiError(normalized.message, response.status, normalized.details);
  }

  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}
