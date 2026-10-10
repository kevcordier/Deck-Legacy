import type {
  ApiErrorBody,
  GameExport,
  GameSummary,
  SyncGameRequest,
  UserProfile,
} from '@deck-legacy/api-contract';
import { config } from '@services/config';

/** Error returned by the API (or a network failure, with `status` 0). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody | null,
  ) {
    super(body?.message ?? (status === 0 ? 'errors.network' : `HTTP ${status}`));
    this.name = 'ApiError';
  }

  get code() {
    return this.body?.code;
  }
}

type TokenProvider = () => Promise<string | null>;

let getAccessToken: TokenProvider = () => Promise.resolve(null);

/** Called by `AuthProvider` so every request carries the current Supabase access token. */
export function setAccessTokenProvider(provider: TokenProvider): void {
  getAccessToken = provider;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(`${config.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, null);
  }

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(response.status, payload as ApiErrorBody | null);
  }
  return payload as T;
}

export const api = {
  /** The account's kingdoms (non-abandoned games), most recently synced first. */
  listGames: () => request<GameSummary[]>('GET', '/games'),
  syncGame: (id: string, body: SyncGameRequest) =>
    request<GameSummary>('PUT', `/games/${id}`, body),
  exportGame: (id: string) => request<GameExport>('GET', `/games/${id}/export`),
  abandonGame: (id: string) => request<undefined>('DELETE', `/games/${id}`),

  getMe: () => request<UserProfile>('GET', '/me'),
  updateMe: (displayName: string) => request<UserProfile>('PATCH', '/me', { displayName }),
  /** Deletes the account and all its data (kingdoms, scores). */
  deleteMe: () => request<undefined>('DELETE', '/me'),
};
