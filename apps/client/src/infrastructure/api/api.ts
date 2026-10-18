import { accessToken } from './accessToken';
import { ApiError } from '@application/ports/ApiError';
import type {
  ApiErrorBody,
  GameExport,
  GameSummary,
  KingdomRanking,
  SyncGameRequest,
  UserProfile,
} from '@application/ports/apiTypes';
import type { paths } from '@infrastructure/api/generated/schema';
import { config } from '@infrastructure/config/config';
import createClient from 'openapi-fetch';

// `fetch` is looked up on each call (not captured at import) so tests can stub it.
const client = createClient<paths>({ baseUrl: config.apiUrl, fetch: request => fetch(request) });
client.use({
  async onRequest({ request }) {
    const token = await accessToken.get();
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

/** The Deck-Legacy API (`apps/server/openapi.json`); errors are thrown as `ApiError`. */
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
