import type { GameExport, GameSummary, SyncGameRequest } from './apiTypes';

/** Game endpoints of the API used by the sync; failures throw `ApiError`. */
export interface GameApi {
  listGames(): Promise<GameSummary[]>;
  syncGame(id: string, body: SyncGameRequest): Promise<GameSummary>;
  exportGame(id: string): Promise<GameExport>;
  abandonGame(id: string): Promise<undefined>;
}
