/**
 * Shared HTTP contract between the NestJS server and the React Native client.
 *
 * Games are played on the device (offline included); the client syncs each game's event log
 * to the server, which replays it to validate it and to compute scores.
 */
import type { GameEvent } from '@deck-legacy/engine/domain/types';
import { z } from 'zod';

const isObject = (value: unknown): boolean => typeof value === 'object' && value !== null;

// ─── Kingdoms ─────────────────────────────────────────────────────────────────

/** A kingdom is one synced game (one save) of a player. */
export const KINGDOM_NAME_MAX_LENGTH = 40;

/** Maximum number of kingdoms (non-abandoned games) per registered account. */
export const MAX_KINGDOMS_PER_ACCOUNT = 10;

/** Maximum number of kingdoms for a guest (anonymous) or offline player. */
export const MAX_KINGDOMS_PER_GUEST = 1;

export function kingdomLimit(isAnonymous: boolean): number {
  return isAnonymous ? MAX_KINGDOMS_PER_GUEST : MAX_KINGDOMS_PER_ACCOUNT;
}

// ─── Requests ─────────────────────────────────────────────────────────────────

/**
 * `PUT /games/:id` — the events of a game from `fromSeq` on (the server keeps the ones before).
 * With `baseVersion`, the server refuses (`409 STALE_VERSION`) a sync built on another version;
 * without it, the sync overwrites the stored game (clients older than the delta sync).
 */
export const syncGameRequestSchema = z.object({
  events: z.array(z.custom<GameEvent>(isObject)).max(20_000),
  /** Index, in the full log, of the first event sent. */
  fromSeq: z.number().int().min(0).default(0),
  /** Server version the client built on. */
  baseVersion: z.number().int().min(1).optional(),
  cardNames: z.record(z.string(), z.string().max(60)).default({}),
  /** Kingdom name chosen by the player; metadata outside the event log. */
  name: z.string().trim().max(KINGDOM_NAME_MAX_LENGTH).default(''),
});
export type SyncGameRequest = z.infer<typeof syncGameRequestSchema>;

export const updateProfileRequestSchema = z.object({
  displayName: z.string().trim().min(2).max(32),
});
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

// ─── Responses ────────────────────────────────────────────────────────────────

/** Score at the end of a campaign segment (`base` or an expansion name). */
export type CampaignSegmentScore = {
  segment: string;
  /** Cumulative score of the whole campaign when the segment ended. */
  score: number;
};

/** Server-side state of a synced game (a kingdom). */
export type GameSummary = {
  id: string;
  name: string;
  /** Incremented on every accepted sync. */
  version: number;
  eventCount: number;
  /** Score computed by the server when replaying the events. */
  score: number;
  /** Segment scores in the order they were played. */
  segments: CampaignSegmentScore[];
  finished: boolean;
  /** ISO date of the last accepted sync. */
  updatedAt: string;
};

export type GameExport = {
  id: string;
  name: string;
  events: GameEvent[];
  cardNames: Record<string, string>;
  savedAt: number;
};

export type UserProfile = {
  id: string;
  displayName: string | null;
  isAnonymous: boolean;
  email: string | null;
};

export type ScoreEntry = {
  id: string;
  gameId: string;
  segment: string;
  score: number;
  createdAt: string;
  displayName: string | null;
};

export type LeaderboardResponse = {
  segment: string;
  entries: ScoreEntry[];
};

export type ApiErrorBody = {
  statusCode: number;
  code: ApiErrorCode;
  message: string;
};

export type ApiErrorCode =
  | 'VALIDATION'
  | 'INVALID_GAME'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVER_ERROR'
  | 'KINGDOM_LIMIT'
  | 'STALE_VERSION';
