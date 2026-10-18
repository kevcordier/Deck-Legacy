import type { paths } from '../infrastructure/api/generated/schema';
import type {
  ApiErrorBody,
  GameExport,
  GameSummary,
  KingdomRanking,
  SyncGameRequest,
  UserProfile,
} from '@services/apiTypes';
import { config } from '@services/config';
import createClient from 'openapi-fetch';

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

// `fetch` is looked up on each call (not captured at import) so tests can stub it.
const client = createClient<paths>({ baseUrl: config.apiUrl, fetch: request => fetch(request) });
client.use({
  async onRequest({ request }) {
    const token = await getAccessToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    return request;
  },
});

type Result<T> = { data?: T; error?: unknown; response: Response };

/** Unwraps an openapi-fetch call: the data, or an `ApiError` (status 0 when the network fails). */
async function call<T>(promise: Promise<Result<T>>): Promise<T> {
  let result: Result<T>;
  try {
    result = await promise;
  } catch {
    throw new ApiError(0, null);
  }
  if (!result.response.ok) {
    throw new ApiError(result.response.status, (result.error as ApiErrorBody | undefined) ?? null);
  }
  return result.data as T;
}

const byId = (id: string) => ({ params: { path: { id } } });

// The API documents events as plain JSON objects: `syncGame` and `exportGame` cast them to the
// engine types (`apiTypes.ts`), which the server replay validates.

export const api = {
  /** The account's kingdoms (non-abandoned games), most recently synced first. */
  listGames: () => call<GameSummary[]>(client.GET('/games')),
  syncGame: (id: string, body: SyncGameRequest) =>
    call<GameSummary>(client.PUT('/games/{id}', { ...byId(id), body: body as never })),
  exportGame: (id: string) =>
    call(client.GET('/games/{id}/export', byId(id))) as unknown as Promise<GameExport>,
  abandonGame: (id: string) => call<undefined>(client.DELETE('/games/{id}', byId(id))),

  getMe: () => call<UserProfile>(client.GET('/me')),
  updateMe: (displayName: string) =>
    call<UserProfile>(client.PATCH('/me', { body: { displayName } })),
  /** Deletes the account and all its data (kingdoms, scores). */
  deleteMe: () => call<undefined>(client.DELETE('/me')),

  /** Kingdoms of registered players with the best total score. */
  kingdomLeaderboard: () => call<KingdomRanking[]>(client.GET('/scores/kingdoms')),
};
