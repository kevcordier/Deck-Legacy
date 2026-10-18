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
  UnverifiedGameError,
  checkpointSeq,
} from '@deck-legacy/engine/application/session/GameSession';
import { GameEventType, Phase } from '@deck-legacy/engine/domain/enums';
import type {
  CardActionEvent,
  GameCatalog,
  GameCheckpoint,
  GameEvent,
} from '@deck-legacy/engine/domain/types';
import { loadGameCatalog } from '@deck-legacy/game-data';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

/**
 * Events produced by the development cheat panel (`GameSession` cheat commands): tagged
 * `cheat`, or, before the tag existed, card actions named `cheat_…`.
 */
function usesCheats(events: GameEvent[]): boolean {
  return events.some(
    event =>
      event.cheat === true ||
      (event.type === GameEventType.CARD_ACTION &&
        (event as CardActionEvent).actionId.startsWith('cheat_')),
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

function staleVersion(): ConflictException {
  return new ConflictException({ code: 'STALE_VERSION', message: 'errors.staleVersion' });
}

/**
 * Stores games played on devices.
 *
 * Each sync sends the events from `fromSeq` on; the server rebuilds the full log with the stored
 * events before `fromSeq`, replays it with the engine to check it is a
 * consistent game, computes the score and mirrors campaign scores for the leaderboard. A sync
 * with a `baseVersion` other than the stored version is refused (another device synced first);
 * without one, the last sync wins. The server runs the recorded player commands again from the
 * game seed and refuses a log they do not produce (EDR-051); older games without a seed are only
 * replayed: new ones are stored unverified, out of the leaderboards; stored ones keep their flag.
 * The state at the start of the last round is kept as a checkpoint: while the incoming log keeps
 * the events it covers, a sync only checks the events after it (EDR-052).
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
      version: game.version,
      events: game.events,
      cardNames: game.cardNames,
      savedAt: game.updatedAt.getTime(),
      checkpoint: game.checkpoint,
    };
  }

  sync(user: AuthUser, gameId: string, body: SyncGameRequest): Promise<GameSummary> {
    const userId = user.id;
    const limit = kingdomLimit(user.isAnonymous);
    return this.withLock(gameId, async () => {
      const meta = await this.repository.getMeta(gameId);
      if (meta && meta.userId !== userId) throw new NotFoundException('Game not found');
      if (meta && body.baseVersion !== undefined && body.baseVersion !== meta.version) {
        throw staleVersion();
      }
      const storedIds = meta ? await this.repository.getEventIds(gameId) : [];
      if (body.fromSeq > storedIds.length) throw staleVersion();
      const kept =
        body.fromSeq > 0 ? await this.repository.getEventPayloads(gameId, body.fromSeq) : [];
      const events = [...kept, ...body.events];
      const firstChange = firstDifference(storedIds, events);
      // A log rewritten before the checkpoint (development rewind, overwrite) is checked in full.
      const checkpoint =
        meta?.checkpoint && meta.checkpoint.seq <= firstChange ? meta.checkpoint : undefined;
      const snapshot = this.validate({ ...body, events }, checkpoint);

      const mirrorScores = (tx: Parameters<ScoresService['syncGameScores']>[0]) =>
        this.scores.syncGameScores(tx, userId, gameId, snapshot.campaignScores);

      if (meta) {
        await this.repository.save(gameId, userId, limit, firstChange, snapshot, mirrorScores);
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
    checkpoint?: GameCheckpoint,
  ): GameSnapshot & { campaignScores: Record<string, number> } {
    if (body.events.length === 0) {
      throw new UnprocessableEntityException('Empty event log');
    }
    if (!this.allowCheats && usesCheats(body.events)) {
      throw new UnprocessableEntityException('Games using development cheats are not accepted');
    }
    const { session, verified } = this.replay(body.events, checkpoint);
    const state = session.getState();
    return {
      events: body.events,
      name: body.name,
      cardNames: body.cardNames,
      score: session.getScore(),
      segments: session.getCampaignSegments(),
      finished: state.phase === Phase.GAME_OVER,
      verified,
      campaignScores: state.campaignScores,
      checkpoint: this.nextCheckpoint(body.events, checkpoint),
    };
  }

  /**
   * The checkpoint to keep after a checked log: the state at the start of its last round, rebuilt
   * from the previous checkpoint (so a corrected checkpoint carries over), or the previous one.
   */
  private nextCheckpoint(events: GameEvent[], previous?: GameCheckpoint): GameCheckpoint | null {
    const seq = checkpointSeq(events);
    if (seq <= (previous?.seq ?? 0)) return previous ?? null;
    const options = { allowCheats: false, unrestrictedRewind: false };
    const session = GameSession.restore(
      'sync',
      events.slice(0, seq),
      this.catalog,
      options,
      {},
      previous,
    );
    return { seq, state: session.getState() };
  }

  /**
   * Runs the player's recorded commands again (EDR-051): the score then comes from the server's
   * own run. Games started before EDR-051 can only be replayed (`verified` undefined): a new one is
   * stored unverified, a stored one keeps its flag (the games trusted by the migration).
   */
  private replay(
    events: GameEvent[],
    checkpoint?: GameCheckpoint,
  ): { session: GameSession; verified?: boolean } {
    try {
      // Development games with cheats (accepted when `allowCheats`) can only be replayed.
      const verified = usesCheats(events)
        ? null
        : GameSession.verify('sync', events, this.catalog, checkpoint);
      if (verified) return { session: verified, verified: true };
      const options = { allowCheats: false, unrestrictedRewind: false };
      const session = GameSession.restore('sync', events, this.catalog, options, {}, checkpoint);
      return { session };
    } catch (error) {
      if (error instanceof UnverifiedGameError) {
        throw new UnprocessableEntityException('Event log does not match the player commands');
      }
      if (error instanceof CorruptedGameError) {
        throw new UnprocessableEntityException('Event log cannot be replayed');
      }
      throw error;
    }
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
