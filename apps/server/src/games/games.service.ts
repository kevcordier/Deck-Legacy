import type { AuthUser } from '../auth/auth-user';
import { APP_CONFIG, type AppConfig } from '../config/env';
import { ScoresService } from '../scores/scores.service';
import { type GameSnapshot, GamesRepository } from './games.repository';
import {
  type GameExport,
  type GameSummary,
  type SyncGameRequest,
  kingdomLimit,
} from '@deck-legacy/api-contract';
import {
  CorruptedGameError,
  GameSession,
} from '@deck-legacy/engine/application/session/GameSession';
import { GameEventType, Phase } from '@deck-legacy/engine/domain/enums';
import type { CardActionEvent, GameCatalog, GameEvent } from '@deck-legacy/engine/domain/types';
import { loadGameCatalog } from '@deck-legacy/game-data';
import {
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

/** Events produced by the development cheat panel (`GameSession` cheat commands). */
function usesCheats(events: GameEvent[]): boolean {
  return events.some(
    event =>
      event.type === GameEventType.CARD_ACTION &&
      (event as CardActionEvent).actionId.startsWith('cheat_'),
  );
}

/** Index of the first event that differs between the stored and the incoming log. */
export function firstDifference(storedIds: string[], events: GameEvent[]): number {
  let index = 0;
  while (
    index < storedIds.length &&
    index < events.length &&
    storedIds[index] === events[index].id
  ) {
    index += 1;
  }
  return index;
}

/**
 * Stores games played on devices.
 *
 * Each sync sends the full event log; the server replays it with the engine to check it is a
 * consistent game, computes the score and mirrors campaign scores for the leaderboard. The
 * last sync wins. Replaying proves consistency, not fairness: events are produced by the
 * client, so a modified client could forge them.
 */
@Injectable()
export class GamesService {
  private readonly catalog: GameCatalog = loadGameCatalog();
  private readonly locks = new Map<string, Promise<unknown>>();
  private readonly allowCheats: boolean;

  constructor(
    private readonly repository: GamesRepository,
    private readonly scores: ScoresService,
    @Inject(APP_CONFIG) config: AppConfig,
  ) {
    this.allowCheats = config.allowCheats;
  }

  getCurrent(userId: string): Promise<GameSummary | null> {
    return this.repository.findCurrent(userId);
  }

  /** The player's kingdoms (non-abandoned games). */
  list(userId: string): Promise<GameSummary[]> {
    return this.repository.list(userId);
  }

  async exportGame(userId: string, gameId: string): Promise<GameExport> {
    const game = await this.repository.load(gameId);
    if (game?.userId !== userId) throw new NotFoundException('Game not found');
    return {
      id: game.id,
      name: game.name,
      events: game.events,
      cardNames: game.cardNames,
      savedAt: game.updatedAt.getTime(),
    };
  }

  sync(user: AuthUser, gameId: string, body: SyncGameRequest): Promise<GameSummary> {
    const userId = user.id;
    const limit = kingdomLimit(user.isAnonymous);
    return this.withLock(gameId, async () => {
      const snapshot = this.validate(body);
      const meta = await this.repository.getMeta(gameId);
      if (meta && meta.userId !== userId) throw new NotFoundException('Game not found');

      const mirrorScores = (tx: Parameters<ScoresService['syncGameScores']>[0]) =>
        this.scores.syncGameScores(tx, userId, gameId, snapshot.campaignScores);

      if (meta) {
        const storedIds = await this.repository.getEventIds(gameId);
        await this.repository.save(
          gameId,
          userId,
          limit,
          firstDifference(storedIds, snapshot.events),
          snapshot,
          mirrorScores,
        );
      } else {
        await this.repository.create(gameId, userId, limit, snapshot, mirrorScores);
      }
      return this.repository.getSummary(gameId);
    });
  }

  async abandonCurrent(userId: string): Promise<void> {
    const current = await this.repository.findCurrent(userId);
    if (current) await this.abandon(userId, current.id);
  }

  async abandon(userId: string, gameId: string): Promise<void> {
    if (!(await this.repository.abandon(gameId, userId))) {
      throw new NotFoundException('Game not found');
    }
  }

  /** Replays the events with the engine; rejects logs that cannot be replayed. */
  private validate(
    body: SyncGameRequest,
  ): GameSnapshot & { campaignScores: Record<string, number> } {
    if (body.events.length === 0) {
      throw new UnprocessableEntityException('Empty event log');
    }
    if (!this.allowCheats && usesCheats(body.events)) {
      throw new UnprocessableEntityException('Games using development cheats are not accepted');
    }
    let session: GameSession;
    try {
      session = GameSession.restore('sync', body.events, this.catalog, {
        allowCheats: false,
        unrestrictedRewind: false,
      });
    } catch (error) {
      if (error instanceof CorruptedGameError) {
        throw new UnprocessableEntityException('Event log cannot be replayed');
      }
      throw error;
    }
    const state = session.getState();
    return {
      events: body.events,
      name: body.name,
      cardNames: body.cardNames,
      score: session.getScore(),
      segments: session.getCampaignSegments(),
      finished: state.phase === Phase.GAME_OVER,
      campaignScores: state.campaignScores,
    };
  }

  /** Serialises work per game so concurrent syncs never interleave. */
  private async withLock<T>(gameId: string, work: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(gameId) ?? Promise.resolve();
    const run = previous.then(work, work);
    const tail = run.catch(() => undefined);
    this.locks.set(gameId, tail);
    try {
      return await run;
    } finally {
      if (this.locks.get(gameId) === tail) this.locks.delete(gameId);
    }
  }
}
