import type { Transaction } from '../../prisma/transaction';
import type { GameMeta } from '../domain/game-meta';
import type { GameSnapshot } from '../domain/game-snapshot';
import type { StoredGame } from '../domain/stored-game';
import type { GameSummary } from './models/game-summary';
import type { GameEvent } from '@deck-legacy/engine/domain/types';

/** Storage of synced games; the Nest injection token is the class itself. */
export abstract class GamesRepository {
  /** Latest non-abandoned game of a player. */
  abstract findCurrent(userId: string): Promise<GameSummary | null>;

  /** Non-abandoned games (kingdoms) of a player, most recently synced first. */
  abstract list(userId: string): Promise<GameSummary[]>;

  abstract getSummary(gameId: string): Promise<GameSummary>;

  /** Owner, version and checkpoint of a game, whatever its status. */
  abstract getMeta(gameId: string): Promise<GameMeta | null>;

  abstract getEventIds(gameId: string): Promise<string[]>;

  /** Stored events before `seq` `before`, in order (the part of the log a delta sync keeps). */
  abstract getEventPayloads(gameId: string, before: number): Promise<GameEvent[]>;

  /** Full game for export; abandoned games are hidden. */
  abstract load(gameId: string): Promise<StoredGame | null>;

  /**
   * Creates a game (a new kingdom). Refused with `KINGDOM_LIMIT` when the player already has
   * `limit` non-abandoned games.
   */
  abstract create(
    gameId: string,
    userId: string,
    limit: number,
    snapshot: GameSnapshot,
    afterWrite?: (tx: Transaction) => Promise<void>,
  ): Promise<void>;

  /**
   * Replaces the event log from `fromSeq` (the first event that differs from the stored log)
   * and bumps the version. A previously abandoned game becomes active again, within the
   * player's kingdom limit.
   */
  abstract save(
    gameId: string,
    userId: string,
    limit: number,
    fromSeq: number,
    snapshot: GameSnapshot,
    afterWrite?: (tx: Transaction) => Promise<void>,
  ): Promise<void>;

  abstract abandon(gameId: string, userId: string): Promise<boolean>;
}
