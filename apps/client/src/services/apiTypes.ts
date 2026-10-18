import type { components } from '../infrastructure/api/generated/schema';
import type { GameCheckpoint, GameEvent } from '@deck-legacy/engine/domain/types';

/** Shorter names for the schemas generated from the API's `openapi.json` (`pnpm generate:api`). */
type Schemas = components['schemas'];

export type GameSummary = Schemas['GameSummaryDto'];
export type CampaignSegmentScore = GameSummary['segments'][number];
export type UserProfile = Schemas['UserProfileDto'];
export type KingdomRanking = Schemas['KingdomRankingDto'];
export type ApiErrorBody = Schemas['ApiErrorDto'];
export type SyncGameRequest = Omit<Schemas['SyncGameRequestDto'], 'events'> & {
  events: GameEvent[];
};
/** The API documents events and checkpoints as plain objects; the engine gives them their type. */
export type GameExport = Omit<Schemas['GameExportDto'], 'events' | 'checkpoint'> & {
  events: GameEvent[];
  checkpoint?: GameCheckpoint | null;
};
